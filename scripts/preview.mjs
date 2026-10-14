import { spawn } from 'node:child_process';
import { mkdirSync, openSync, closeSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const qa = process.argv.includes('--qa');
const port = qa ? 3006 : 3005;
const origin = `http://127.0.0.1:${port}`;
// Build output is cleared by next build; keep persistent launcher logs outside it.
const logs = join(root, '.local', qa ? 'qa' : 'preview');
async function health() {
  try {
    const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(4000) });
    const data = await response.json();
    if (data.service === 'sleekviber') return { ours: true, ready: response.ok && data.ok };
    return { ours: false, ready: false };
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return null;
    // An occupied port must not be silently replaced or stopped.
    try { await fetch(origin, { signal: AbortSignal.timeout(2000) }); return { ours: false, ready: false }; } catch { return null; }
  }
}
const existing = await health();
if (existing) {
  if (!existing.ours) throw new Error(`Port ${port} is already occupied by another service. It was not stopped.`);
  if (!existing.ready) throw new Error('SleekViber is running, but storage is unavailable. Check DATABASE_URL and run db:setup.');
} else {
  mkdirSync(logs, { recursive: true });
  const out = openSync(join(logs, 'preview.out.log'), 'a');
  const err = openSync(join(logs, 'preview.err.log'), 'a');
  const env = qa ? { ...process.env, NODE_ENV: 'production', DATABASE_URL: '', VERCEL: '', SLEEKVIBER_DB_PATH: join(logs, 'survey.db'), ADMIN_PASSWORD: 'qa-only-admin-password', ADMIN_SESSION_SECRET: 'qa-only-signing-secret-at-least-32-characters' } : process.env;
  const child = spawn(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), qa ? 'start' : 'dev', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: root, env, detached: true, windowsHide: true, stdio: ['ignore', out, err] });
  child.on('error', () => { console.error(`Could not start SleekViber. Check the preview logs in ${logs}.`); process.exitCode = 1; });
  child.unref(); closeSync(out); closeSync(err);
  writeFileSync(join(logs, 'preview-process.json'), JSON.stringify({ launcherPid: child.pid, origin, startedAt: new Date().toISOString() }));
  let ready = false;
  for (let i = 0; i < 60; i++) {
    const state = await health();
    if (state?.ours && state.ready) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error(`SleekViber did not become ready. Check ${join(logs, 'preview.err.log')} and the database configuration.`);
}
console.log(`Website: http://localhost:${port}/\nSurvey and results: http://localhost:${port}/#questionnaire\nAdmin: http://localhost:${port}/admin\n${qa ? 'Isolated QA build. Test submissions go only to .local/qa/survey.db.' : 'This local preview remains running after this command exits. A public URL requires deployment.'}`);
