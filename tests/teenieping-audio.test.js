// Run with: node --test tests/teenieping-audio.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const TeeniepingAudio = require('../js/teenieping-audio.js');

const ROOT_DIR = path.dirname(__dirname);

test('TeeniepingAudio CLIP_MAP has audio clip paths for all 6 characters', () => {
  const { CLIP_MAP } = TeeniepingAudio;
  const expectedChars = ['heartsping', 'lalaping', 'chachaping', 'gogoping', 'dadaping', 'happyping'];

  for (const charId of expectedChars) {
    const config = CLIP_MAP[charId];
    assert.ok(config, `Missing config for ${charId}`);
    assert.ok(typeof config.greeting === 'string');
    assert.ok(typeof config.catchphrase === 'string');
    assert.ok(Array.isArray(config.cheers) && config.cheers.length >= 2);
    assert.ok(typeof config.tag === 'string');
    assert.ok(typeof config.hint === 'string');
  }
});

test('All registered Teenieping audio files exist and are valid non-empty MP3s', () => {
  const { CLIP_MAP } = TeeniepingAudio;

  for (const [charId, config] of Object.entries(CLIP_MAP)) {
    const fileList = [
      config.greeting,
      config.catchphrase,
      ...config.cheers,
      config.tag,
      config.hint,
    ];

    for (const relPath of fileList) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `Audio file does not exist: ${relPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 2000, `Audio file ${relPath} is suspiciously small: ${stat.size} bytes`);
    }
  }
});

test('manifest.json accurately documents all generated audio clips', () => {
  const manifestPath = path.join(ROOT_DIR, 'audio', 'teenieping', 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.strictEqual(manifest.version, '1.0');
  const expectedChars = ['heartsping', 'lalaping', 'chachaping', 'gogoping', 'dadaping', 'happyping'];
  for (const charId of expectedChars) {
    const charClips = manifest.characters[charId];
    assert.ok(charClips, `Manifest missing ${charId}`);
    assert.ok(charClips.greeting && charClips.greeting.file);
    assert.ok(charClips.catchphrase && charClips.catchphrase.file);
    assert.ok(charClips.cheer_1 && charClips.cheer_1.file);
    assert.ok(charClips.cheer_2 && charClips.cheer_2.file);
    assert.ok(charClips.tag && charClips.tag.file);
    assert.ok(charClips.hint && charClips.hint.file);
  }
});

test('getClipUrl correctly resolves audio paths and randomizes cheers', () => {
  const { engine } = TeeniepingAudio;

  const greetingUrl = engine.getClipUrl('heartsping', 'greeting');
  assert.strictEqual(greetingUrl, 'audio/teenieping/heartsping/greeting.mp3');

  const catchphraseUrl = engine.getClipUrl('lalaping', 'catchphrase');
  assert.strictEqual(catchphraseUrl, 'audio/teenieping/lalaping/catchphrase.mp3');

  const tagUrl = engine.getClipUrl('gogoping', 'tag');
  assert.strictEqual(tagUrl, 'audio/teenieping/gogoping/tag.mp3');

  const hintUrl = engine.getClipUrl('dadaping', 'hint');
  assert.strictEqual(hintUrl, 'audio/teenieping/dadaping/hint.mp3');

  // Verify cheer resolution
  const cheersSeen = new Set();
  for (let i = 0; i < 30; i++) {
    cheersSeen.add(engine.getClipUrl('heartsping', 'cheer'));
  }
  assert.ok(cheersSeen.size >= 2, 'Should randomize between available cheer clips');
});

test('computeWordOffsets parses words and generates monotonic start fractions', () => {
  const text = 'Heartsping found 25 moon rocks on Monday.';
  const words = TeeniepingAudio.computeWordOffsets(text);

  assert.strictEqual(words.length, 7);
  assert.strictEqual(words[0].text, 'Heartsping');
  assert.strictEqual(words[0].charIndex, 0);
  assert.strictEqual(words[0].startFrac, 0);

  assert.strictEqual(words[1].text, 'found');
  assert.strictEqual(words[1].charIndex, 11);

  assert.strictEqual(words[2].text, '25');
  assert.strictEqual(words[2].charIndex, 17);

  for (let i = 1; i < words.length; i++) {
    assert.ok(words[i].startFrac > words[i - 1].startFrac, 'startFrac must be monotonically increasing');
    assert.ok(words[i].charIndex > words[i - 1].charIndex, 'charIndex must be monotonically increasing');
  }

  // Edge cases
  assert.deepStrictEqual(TeeniepingAudio.computeWordOffsets(''), []);
  assert.deepStrictEqual(TeeniepingAudio.computeWordOffsets(null), []);
});

test('speakText falls back cleanly without errors in non-browser Node runtime', (t, done) => {
  let finished = false;
  TeeniepingAudio.speakText('Hello world', {
    charId: 'heartsping',
    onEnd: () => {
      finished = true;
      assert.ok(finished);
      done();
    },
  });
});
