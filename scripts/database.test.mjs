import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const scratch = mkdtempSync(join(tmpdir(), 'sleekviber-database-test-'));
const source = join(scratch, 'source.db');
const env = { ...process.env, DATABASE_URL: '', VERCEL: '', SLEEKVIBER_DB_PATH: source };
const fixture = new DatabaseSync(source);
fixture.exec(`PRAGMA journal_mode=WAL;
  CREATE TABLE pulse_responses (id TEXT PRIMARY KEY, q1 TEXT, q2 TEXT, timestamp TEXT, user_agent TEXT, fingerprint TEXT);
  CREATE TABLE survey_starts (session_id TEXT PRIMARY KEY, timestamp TEXT);
  CREATE TABLE waitlist (email TEXT PRIMARY KEY, timestamp TEXT);
  CREATE TABLE responses (id TEXT PRIMARY KEY, interest TEXT, problems TEXT, created_at TEXT);`);
fixture.prepare('INSERT INTO pulse_responses VALUES (?,?,?,?,?,?)').run('existing', 'Just curious', '["No SEO"]', '2026-10-12T00:00:00.000Z', 'test', 'fixture');
fixture.prepare('INSERT INTO responses VALUES (?,?,?,?)').run('legacy', 'curious', '["design"]', '2026-10-01');

function cli(...args) {
  return spawnSync(process.execPath, [join(root, 'scripts/database.mjs'), ...args], { cwd: root, env, encoding: 'utf8', windowsHide: true });
}

test('health, WAL-aware backup and migration dry-run preserve source data', () => {
  const before = readFileSync(source);
  const health = cli('check');
  assert.equal(health.status, 0, health.stderr);
  assert.equal(JSON.parse(health.stdout).records.pulse_responses, 1);
  const migration = cli('migrate', '--dry-run');
  assert.equal(migration.status, 0, migration.stderr);
  assert.equal(JSON.parse(migration.stdout).records.responses, 1);
  const backup = cli('backup');
  assert.equal(backup.status, 0, backup.stderr);
  const result = JSON.parse(backup.stdout);
  const restored = new DatabaseSync(result.backup, { readOnly: true });
  try {
    assert.deepEqual({ ...restored.prepare('SELECT * FROM pulse_responses').get() }, { ...fixture.prepare('SELECT * FROM pulse_responses').get() });
    assert.equal(restored.prepare('SELECT COUNT(*) AS count FROM responses').get().count, 1);
  } finally { restored.close(); }
  assert.equal(cli('backup').status, 0);
  assert.equal(readdirSync(join(scratch, 'backups')).length, 2);
  assert.deepEqual(readFileSync(source), before);
});

test('missing source fails without creating an empty database', () => {
  const missing = join(scratch, 'missing.db');
  const result = spawnSync(process.execPath, [join(root, 'scripts/database.mjs'), 'check'], { cwd: root, env: { ...env, SLEEKVIBER_DB_PATH: missing }, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 1);
  assert.equal(existsSync(missing), false);
});

async function startApp(overrides = {}) {
  const socket = createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const origin = `http://localhost:${port}`;
  const child = spawn(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
    cwd: root, windowsHide: true,
    env: { ...env, NODE_ENV: 'production', ADMIN_PASSWORD: 'isolated-test-password', ADMIN_SESSION_SECRET: 'isolated-test-secret-with-at-least-32-characters', ...overrides },
    stdio: 'ignore',
  });
  const stopped = new Promise(resolve => child.once('exit', resolve));
  async function stop() { if (child.exitCode === null) child.kill(); await stopped; }
  try {
    for (let attempt = 0; attempt < 80; attempt++) {
      if (child.exitCode !== null) throw new Error('Test server exited before starting. Build the app first.');
      try { if ((await fetch(`${origin}/api/responses/stats`)).status === 401) return { origin, stop }; } catch { /* starting */ }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error('Test server did not become ready.');
  } catch (error) { await stop(); throw error; }
}

test('real routes persist polls, enforce validation/deduplication and protect stats', async () => {
  const dbPath = join(scratch, 'routes.db');
  const app = await startApp({ SLEEKVIBER_DB_PATH: dbPath });
  const post = (path, body, headers = {}) => fetch(`${app.origin}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: app.origin, ...headers }, body: JSON.stringify(body) });
  try {
    assert.equal((await fetch(`${app.origin}/api/responses/stats`)).status, 401);
    const empty = await fetch(`${app.origin}/api/responses/results`);
    assert.equal(empty.status, 200);
    assert.equal((await empty.json()).total, 0);
    const valid = { q1: 'Just curious', q2: ['No SEO'] };
    assert.equal((await post('/api/responses', valid, { Origin: 'https://invalid.example' })).status, 403);
    assert.equal((await post('/api/responses', { ...valid, q2: ['All of the above', 'No SEO'] })).status, 400);
    assert.equal((await post('/api/responses', { ...valid, q1: 'unknown' })).status, 400);
    const outcomes = await Promise.all(Array.from({ length: 6 }, () => post('/api/responses', valid).then(response => response.status)));
    assert.equal(outcomes.filter(status => status === 201).length, 1);
    assert.equal(outcomes.filter(status => status === 409).length, 5);
    const sessionId = randomUUID();
    await post('/api/responses/start', { sessionId });
    await post('/api/responses/start', { sessionId });
    await post('/api/emails', { email: 'Test@Example.invalid' });
    await post('/api/emails', { email: 'test@example.invalid' });
    const login = await post('/api/session/login', { password: 'isolated-test-password' });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const response = await fetch(`${app.origin}/api/responses/stats`, { headers: { cookie } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const stats = await response.json();
    assert.equal(stats.total, 1);
    assert.equal(stats.starts, 1);
    assert.equal(stats.waitlist, 1);
    assert.deepEqual(stats.recent[0].q2, ['No SEO']);
    const publicResponse = await fetch(`${app.origin}/api/responses/results`);
    assert.equal(publicResponse.status, 200);
    assert.equal(publicResponse.headers.get('cache-control'), 'no-store');
    const publicResults = await publicResponse.json();
    assert.deepEqual(Object.keys(publicResults).sort(), ['q1', 'q2', 'today', 'total']);
    assert.equal(publicResults.total, 1);
    assert.equal(publicResults.q1.find(item => item.option === 'Just curious').count, 1);
    assert.equal(publicResults.q2.find(item => item.option === 'No SEO').count, 1);
    assert.equal(publicResults.q2.length, 8);
  } finally { await app.stop(); }
  // A new function/server process must read the same saved response.
  const restarted = await startApp({ SLEEKVIBER_DB_PATH: dbPath });
  try {
    const response = await fetch(`${restarted.origin}/api/responses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q1: 'Just curious', q2: ['No SEO'] }) });
    assert.equal(response.status, 409);
  } finally { await restarted.stop(); }
});

test('Vercel cannot silently fall back to ephemeral SQLite', async () => {
  const path = join(scratch, 'must-not-create.db');
  const app = await startApp({ VERCEL: '1', SLEEKVIBER_DB_PATH: path });
  try {
    assert.equal((await fetch(`${app.origin}/api/health`)).status, 503);
    const response = await fetch(`${app.origin}/api/responses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q1: 'Just curious', q2: ['No SEO'] }) });
    assert.equal(response.status, 503);
    assert.equal(existsSync(path), false);
  } finally { await app.stop(); }
});

test('production pages, assets, security headers, bodies and cookies work together', async () => {
  const app = await startApp({ SLEEKVIBER_DB_PATH: join(scratch, 'security-routes.db') });
  const post = (path, body, headers = {}) => fetch(`${app.origin}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: app.origin, ...headers }, body });
  try {
    const landing = await fetch(app.origin);
    assert.equal(landing.status, 200);
    assert.equal(landing.headers.get('x-powered-by'), null);
    assert.equal(landing.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(landing.headers.get('x-frame-options'), 'DENY');
    const csp = landing.headers.get('content-security-policy');
    assert.ok(csp.includes("object-src 'none'"));
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.ok(csp.includes("'wasm-unsafe-eval'"));
    // Three's ImageBitmapLoader fetches embedded GLB textures as local blobs.
    assert.ok(csp.includes("connect-src 'self' blob:"));
    assert.equal(csp.includes("'unsafe-eval'"), false);
    const html = await landing.text();
    assert.ok(html.includes('questionnaire'));
    const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/[^"<>]+)"/g)].map(match => match[1].replaceAll('&amp;', '&')))];
    assert.ok(assets.length > 3);
    for (const asset of [...assets, '/og.png', '/models/studio-laptop.glb', '/environments/studio.hdr', '/draco/draco_wasm_wrapper.js', '/draco/draco_decoder.wasm']) {
      assert.equal((await fetch(new URL(asset, app.origin))).status, 200, asset);
    }
    const health = await fetch(`${app.origin}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { service: 'sleekviber', ok: true });
    const admin = await fetch(`${app.origin}/admin`, { redirect: 'manual' });
    assert.equal(admin.status, 307);
    assert.equal(new URL(admin.headers.get('location'), app.origin).pathname, '/admin/login');
    assert.equal((await fetch(`${app.origin}/admin/login`)).status, 200);
    assert.equal((await fetch(`${app.origin}/api/responses/stats`, { headers: { Cookie: 'sleekviber_admin=tampered' } })).status, 401);
    assert.equal((await fetch(`${app.origin}/api/responses`)).status, 405);
    for (const path of ['/api/responses', '/api/responses/start', '/api/emails', '/api/session/login']) {
      assert.equal((await post(path, '{}', { Origin: 'https://invalid.example' })).status, 403);
      assert.equal((await post(path, '{}', { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
      assert.equal((await post(path, '{}', { 'Content-Type': 'text/plain' })).status, 415);
      const chunked = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(' '.repeat(5000))); controller.close(); } });
      const oversized = await fetch(`${app.origin}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: app.origin }, body: chunked, duplex: 'half' });
      assert.equal(oversized.status, 413, path);
    }
    assert.equal((await post('/api/responses/start', JSON.stringify({ sessionId: '-'.repeat(36) }))).status, 400);
    const login = await post('/api/session/login', JSON.stringify({ password: 'isolated-test-password' }));
    assert.equal(login.status, 200);
    assert.equal(login.headers.get('cache-control'), 'no-store');
    const cookie = login.headers.get('set-cookie');
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=strict']) assert.ok(cookie.includes(flag), flag);
    assert.equal((await fetch(`${app.origin}/admin`, { headers: { Cookie: cookie.split(';')[0] }, redirect: 'manual' })).status, 200);
    const loopbackOrigin = app.origin.replace('localhost', '127.0.0.1');
    assert.equal((await fetch(`${loopbackOrigin}/api/session/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: loopbackOrigin }, body: JSON.stringify({ password: 'isolated-test-password' }) })).status, 200);
    assert.equal((await post('/api/session/logout', '{}', { Origin: 'https://invalid.example' })).status, 403);
    const logout = await post('/api/session/logout', '{}');
    assert.equal(logout.status, 200);
    assert.ok(logout.headers.get('set-cookie').includes('Max-Age=0'));
    assert.ok(logout.headers.get('set-cookie').includes('Secure'));
    assert.equal((await fetch(`${app.origin}/api/responses/results`).then(response => response.json())).total, 0);
  } finally { await app.stop(); }
});

test('two server processes share duplicate protection and persistent login throttling', async () => {
  const dbPath = join(scratch, 'shared-limits.db');
  const first = await startApp({ SLEEKVIBER_DB_PATH: dbPath });
  const second = await startApp({ SLEEKVIBER_DB_PATH: dbPath });
  const post = (app, path, body, ip) => fetch(`${app.origin}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: app.origin, 'x-forwarded-for': ip, 'x-vercel-forwarded-for': ip }, body: JSON.stringify(body) });
  try {
    const votes = await Promise.all(Array.from({ length: 8 }, (_, i) => post(i % 2 ? first : second, '/api/responses', { q1: 'Just curious', q2: ['No SEO'] }, `10.0.0.${i + 1}`).then(response => response.status)));
    assert.equal(votes.filter(status => status === 201).length, 1);
    assert.equal(votes.filter(status => status === 409).length, 7);
    for (let i = 0; i < 5; i++) assert.equal((await post(i % 2 ? first : second, '/api/session/login', { password: 'wrong' }, `10.1.0.${i + 1}`)).status, 401);
    const throttled = await post(second, '/api/session/login', { password: 'isolated-test-password' }, '10.2.0.1');
    assert.equal(throttled.status, 429);
    assert.ok(Number(throttled.headers.get('retry-after')) > 0);
  } finally { await Promise.all([first.stop(), second.stop()]); }
  const restarted = await startApp({ SLEEKVIBER_DB_PATH: dbPath });
  try {
    assert.equal((await post(restarted, '/api/session/login', { password: 'isolated-test-password' }, '10.3.0.1')).status, 429);
    const db = new DatabaseSync(dbPath);
    try { db.prepare('UPDATE request_limits SET expires_at = ?').run(Date.now() - 1); } finally { db.close(); }
    assert.equal((await post(restarted, '/api/session/login', { password: 'isolated-test-password' }, '10.3.0.2')).status, 200);
  } finally { await restarted.stop(); }
});

test.after(() => {
  fixture.close();
  // Delete only this suite's uniquely created directory under the OS temp root.
  const target = resolve(scratch);
  assert.equal(dirnameSafe(target), resolve(tmpdir()));
  rmSync(target, { recursive: true, force: true });
});

function dirnameSafe(path) { return resolve(path, '..'); }
