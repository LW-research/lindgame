// Run with: node --test tests/tts-endpoint.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const SERVER_URL = 'http://127.0.0.1:8642';
let spawnedServer = null;
let serverTtsEnabled = false;

function httpGet(reqPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${SERVER_URL}${reqPath}`;
    const req = http.get(url, options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Request timed out'));
    });
  });
}

async function isServerRunning() {
  try {
    const res = await httpGet('/api/health');
    return res.statusCode === 200;
  } catch {
    return false;
  }
}

function findPythonCmd() {
  const candidates = [
    process.env.PYTHON_CMD,
    process.env.CONDA_PREFIX ? path.join(process.env.CONDA_PREFIX, 'bin', 'python') : null,
    process.env.HOME ? path.join(process.env.HOME, 'miniconda3', 'envs', 'py312_rsrch', 'bin', 'python') : null,
    process.env.HOME ? path.join(process.env.HOME, 'miniconda3', 'bin', 'python') : null,
    process.env.HOME ? path.join(process.env.HOME, 'miniforge3', 'bin', 'python') : null,
    '/opt/homebrew/bin/python3',
    '/usr/local/bin/python3',
    'python3',
    'python',
  ].filter(Boolean);

  for (const cmd of candidates) {
    if (fs.existsSync(cmd) || cmd === 'python3' || cmd === 'python') {
      try {
        const check = spawnSync(cmd, ['-c', 'import edge_tts'], { stdio: 'ignore' });
        if (check.status === 0) return cmd;
      } catch (_) {}
    }
  }

  // Fallback to whichever python is actually executable
  for (const cmd of candidates) {
    try {
      const check = spawnSync(cmd, ['-c', 'import sys'], { stdio: 'ignore' });
      if (check.status === 0) return cmd;
    } catch (_) {}
  }
  return 'python3';
}

before(async () => {
  if (await isServerRunning()) {
    const health = await httpGet('/api/health');
    const data = JSON.parse(health.body.toString('utf8'));
    serverTtsEnabled = !!data.tts;
    return;
  }

  const rootDir = path.dirname(__dirname);
  const pythonCmd = findPythonCmd();

  spawnedServer = spawn(pythonCmd, ['server.py', '--no-browser'], {
    cwd: rootDir,
    stdio: 'ignore',
  });

  const start = Date.now();
  while (Date.now() - start < 5000) {
    await new Promise((r) => setTimeout(r, 200));
    if (await isServerRunning()) {
      const health = await httpGet('/api/health');
      const data = JSON.parse(health.body.toString('utf8'));
      serverTtsEnabled = !!data.tts;
      return;
    }
  }
  throw new Error('Timed out waiting for test server to start');
});

after(() => {
  if (spawnedServer) {
    spawnedServer.kill('SIGTERM');
    spawnedServer = null;
  }
});

test('server /api/health endpoint returns status 200 and healthy status', async () => {
  const res = await httpGet('/api/health');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.headers['content-type'], 'application/json');
  const data = JSON.parse(res.body.toString('utf8'));
  assert.strictEqual(data.status, 'ok');
  assert.strictEqual(typeof data.tts, 'boolean');
});

test('server /api/tts returns 400 when missing text query parameter', async () => {
  const res = await httpGet('/api/tts?char=heartsping');
  assert.strictEqual(res.statusCode, 400);
});

test('server /api/tts rejects text exceeding maximum allowed length of 300 characters', async () => {
  const longText = 'a'.repeat(301);
  const res = await httpGet(`/api/tts?char=heartsping&text=${encodeURIComponent(longText)}`);
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.toString('utf8').includes('exceeds maximum'));
});

test('server /api/tts safely defaults for unknown character names', async (t) => {
  if (!serverTtsEnabled) {
    t.skip('TTS engine not available in environment');
    return;
  }
  const text = encodeURIComponent('Testing fallback for unknown character');
  const res = await httpGet(`/api/tts?char=unknown_character_xyz&text=${text}`);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.headers['content-type'], 'audio/mpeg');
});

test('server /api/tts generates and serves valid MP3 audio for Teenieping characters', async (t) => {
  if (!serverTtsEnabled) {
    t.skip('TTS engine not available in environment');
    return;
  }
  const characters = ['heartsping', 'lalaping', 'chachaping'];

  for (const char of characters) {
    const text = encodeURIComponent(`Hello! I am ${char}!`);
    const res = await httpGet(`/api/tts?char=${char}&text=${text}`);
    assert.strictEqual(res.statusCode, 200, `Failed for character: ${char}`);
    assert.strictEqual(res.headers['content-type'], 'audio/mpeg');
    assert.ok(res.body.length > 2000, `Audio payload for ${char} too small: ${res.body.length}`);
  }
});

test('server /api/tts disk caching returns immediate hit on repeated request', async (t) => {
  if (!serverTtsEnabled) {
    t.skip('TTS engine not available in environment');
    return;
  }
  const text = encodeURIComponent('Testing fast cache response');
  const res1 = await httpGet(`/api/tts?char=heartsping&text=${text}`);
  assert.strictEqual(res1.statusCode, 200);

  const t2 = Date.now();
  const res2 = await httpGet(`/api/tts?char=heartsping&text=${text}`);
  const t3 = Date.now();

  assert.strictEqual(res2.statusCode, 200);
  assert.strictEqual(res1.body.length, res2.body.length);
  // Cache response should take negligible time (< 100ms)
  assert.ok(t3 - t2 < 100, `Cache hit took unexpectedly long: ${t3 - t2}ms`);
});

test('security: directory listing is disabled and returns 404 for folder paths', async () => {
  const res = await httpGet('/audio/cache/');
  assert.strictEqual(res.statusCode, 404);
});

test('security: hidden dotfiles (e.g. .DS_Store, .git) are blocked and return 404', async () => {
  const res1 = await httpGet('/.DS_Store');
  assert.strictEqual(res1.statusCode, 404);

  const res2 = await httpGet('/.git/config');
  assert.strictEqual(res2.statusCode, 404);
});

test('security: server scripts and sensitive files (server.py, package.json) are blocked and return 404', async () => {
  const res1 = await httpGet('/server.py');
  assert.strictEqual(res1.statusCode, 404);

  const res2 = await httpGet('/package.json');
  assert.strictEqual(res2.statusCode, 404);
});

test('security: static web assets (index.html, styles.css) are served normally', async () => {
  const resHtml = await httpGet('/index.html');
  assert.strictEqual(resHtml.statusCode, 200);
  assert.ok(resHtml.body.toString('utf8').includes('Teenieping'));

  const resCss = await httpGet('/css/styles.css');
  assert.strictEqual(resCss.statusCode, 200);
});
