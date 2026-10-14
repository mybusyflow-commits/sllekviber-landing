import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readJson, sameOrigin, clientAddress } from '../lib/request.ts';
import { adminConfigured, validPassword, sessionValue, validSession } from '../lib/session.ts';
import { requestJson } from '../lib/client-request.ts';

test('origin validation includes scheme and browser cross-site metadata', () => {
  const request = (headers) => new Request('https://sleekviber.example/api/responses', { headers });
  assert.equal(sameOrigin(request({ Origin: 'https://sleekviber.example' })), true);
  assert.equal(sameOrigin(request({ Origin: 'http://sleekviber.example' })), false);
  assert.equal(sameOrigin(request({ Origin: 'null' })), false);
  assert.equal(sameOrigin(request({ 'Sec-Fetch-Site': 'cross-site' })), false);
  assert.equal(sameOrigin(request({ 'Sec-Fetch-Site': 'same-origin' })), true);
  assert.equal(sameOrigin(new Request('http://localhost:3006/api', { headers: { Host: '127.0.0.1:3006', Origin: 'http://127.0.0.1:3006' } })), true);
  assert.equal(sameOrigin(new Request('http://localhost:3006/api', { headers: { Host: '127.0.0.1:3006', Origin: 'https://127.0.0.1:3006', 'x-forwarded-proto': 'https' } })), false);
});
test('untrusted forwarded addresses cannot bypass local limits', () => {
  const previous = process.env.VERCEL;
  try {
    process.env.VERCEL = '';
    assert.equal(clientAddress(new Request('http://localhost', { headers: { 'x-forwarded-for': '1.2.3.4' } })), 'local');
    process.env.VERCEL = '1';
    assert.equal(clientAddress(new Request('https://example.test', { headers: { 'x-vercel-forwarded-for': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' } })), '1.2.3.4');
    assert.equal(clientAddress(new Request('https://example.test', { headers: { 'x-vercel-forwarded-for': 'invalid' } })), 'unknown');
  } finally { if (previous === undefined) delete process.env.VERCEL; else process.env.VERCEL = previous; }
});
test('JSON reads enforce actual byte size, type, encoding, and deadline', async () => {
  const request = (body, type = 'application/json') => new Request('http://localhost/api', { method: 'POST', headers: { 'Content-Type': type }, body, duplex: 'half' });
  assert.deepEqual(await readJson(request('{"ok":true}')), { ok: true });
  await assert.rejects(readJson(request('{}', 'text/plain')), { status: 415 });
  await assert.rejects(readJson(request('{')), { status: 400 });
  await assert.rejects(readJson(request(new Uint8Array([255]))), { status: 400 });
  await assert.rejects(readJson(request(' '.repeat(5000))), { status: 413 });
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(' '.repeat(3000))); controller.enqueue(new TextEncoder().encode(' '.repeat(3000))); controller.close(); } });
  await assert.rejects(readJson(request(stream)), { status: 413 });
  let cancelled = false;
  const stalled = new ReadableStream({ cancel() { cancelled = true; } });
  await assert.rejects(readJson(request(stalled), 4096, 15), { status: 408 });
  assert.equal(cancelled, true);
});
test('sessions reject tampering and become invalid after password rotation', () => {
  const oldPassword = process.env.ADMIN_PASSWORD, oldSecret = process.env.ADMIN_SESSION_SECRET;
  try {
    process.env.ADMIN_PASSWORD = 'test-password-with-sufficient-length';
    process.env.ADMIN_SESSION_SECRET = 'test-signing-secret-at-least-32-characters';
    assert.equal(adminConfigured(), true);
    assert.equal(validPassword(process.env.ADMIN_PASSWORD), true);
    assert.equal(validPassword('wrong'), false);
    const cookie = sessionValue();
    assert.equal(validSession(cookie), true);
    assert.equal(validSession(`${cookie}.ignored`), false);
    assert.equal(validSession(cookie.replace(/^\d/, '9')), false);
    assert.equal(validSession('1.' + 'a'.repeat(64)), false);
    process.env.ADMIN_PASSWORD = 'another-password-with-sufficient-length';
    assert.equal(validSession(cookie), false);
    process.env.ADMIN_PASSWORD = 'replace-with-a-long-unique-password';
    assert.equal(adminConfigured(), false);
  } finally { if (oldPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = oldPassword; if (oldSecret === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = oldSecret; }
});

test('client requests recover from stalled bodies and non-JSON service errors', async () => {
  const server = createServer((request, response) => {
    if (request.url === '/unavailable') { response.writeHead(503); response.end('Service unavailable'); }
    else if (request.url === '/invalid') { response.end('invalid JSON'); }
    else if (request.url === '/stalled') { response.writeHead(200, { 'Content-Type': 'application/json' }); response.write('{'); }
    else { response.setHeader('Content-Type', 'application/json'); response.end('{"ok":true}'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.deepEqual((await requestJson(origin)).data, { ok: true });
    const error = await requestJson(`${origin}/unavailable`);
    assert.equal(error.response.status, 503);
    assert.deepEqual(error.data, {});
    await assert.rejects(requestJson(`${origin}/invalid`), /unreadable response/);
    await assert.rejects(requestJson(`${origin}/stalled`, {}, 30), { name: 'TimeoutError' });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(requestJson(origin, { signal: controller.signal }), { name: 'AbortError' });
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
