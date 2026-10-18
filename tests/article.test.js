// Run with: node --test tests/article.test.js
const test = require('node:test');
const assert = require('node:assert');
const { parseArticle, getParagraphTextUpToBlank } = require('../js/data.js');
const { STORY_THEMES, makeArticle } = require('../js/stories.js');

test('all story themes have valid metadata and paragraph generators', () => {
  assert.ok(Array.isArray(STORY_THEMES) && STORY_THEMES.length >= 6);
  for (const theme of STORY_THEMES) {
    assert.ok(theme.id && typeof theme.id === 'string');
    assert.ok(theme.name && typeof theme.name === 'string');
    assert.ok(theme.emoji && typeof theme.emoji === 'string');
    assert.ok(Array.isArray(theme.paragraphs) && theme.paragraphs.length === 4, `${theme.name} should have 4 paragraphs`);
  }
});

test('makeArticle randomly generates valid, leveled first-grade articles', () => {
  for (const theme of STORY_THEMES) {
    const art = makeArticle(theme);
    assert.strictEqual(art.id, theme.id);
    assert.ok(art.title && art.title.length > 0);
    assert.strictEqual(art.paragraphs.length, 4);
    assert.ok(art.level.includes('Grade 1'));

    // Check that generated articles vary across multiple calls (randomization)
    const art2 = makeArticle(theme);
    assert.strictEqual(art2.paragraphs.length, 4);
    // Across 5 generation attempts, title or text should vary due to random cast and sentences
    const titles = new Set();
    for (let i = 0; i < 10; i++) {
      titles.add(makeArticle(theme).title);
    }
    assert.ok(titles.size > 1, `theme ${theme.name} should generate diverse titles/casts`);
  }
});

test('parseArticle accurately extracts blanks and choices from generated stories', () => {
  for (const theme of STORY_THEMES) {
    for (let run = 0; run < 5; run++) {
      const art = makeArticle(theme);
      const parsed = parseArticle(art);
      assert.ok(parsed.blanks.length >= 3, `${art.title} should have at least 3 blanks to fill in`);
      for (const b of parsed.blanks) {
        assert.ok(b.correct && b.correct.length > 0);
        assert.strictEqual(b.distractors.length, 2, 'should have 2 distractors');
        assert.strictEqual(b.choices.length, 3, 'should have 3 choices in total');
        assert.ok(b.choices.includes(b.correct), 'choices must contain correct answer');
        assert.ok(!b.distractors.includes(b.correct), 'distractors must not contain correct answer');
      }
    }
  }
});

test('article text reconstructs completely when blanks filled', () => {
  for (const theme of STORY_THEMES) {
    const art = makeArticle(theme);
    const parsed = parseArticle(art);
    for (const para of parsed.parsedParagraphs) {
      const reconstructed = para.map((seg) => {
        if (seg.type === 'text') return seg.text;
        return parsed.blanks[seg.blankIndex].correct;
      }).join('');
      assert.ok(!reconstructed.includes('[['), 'all [[ brackets should be parsed');
      assert.ok(!reconstructed.includes(']]'), 'all ]] brackets should be parsed');
      assert.ok(reconstructed.length > 20, 'paragraph should have substantial decodable text');
    }
  }
});

test('getParagraphTextUpToBlank reads the paragraph up until the words need to be filled in', () => {
  for (const theme of STORY_THEMES) {
    const art = makeArticle(theme);
    const parsed = parseArticle(art);
    const filled = {};

    for (let bIdx = 0; bIdx < parsed.blanks.length; bIdx++) {
      const textUpToBlank = getParagraphTextUpToBlank(parsed, filled, bIdx);
      const targetBlank = parsed.blanks[bIdx];

      assert.ok(textUpToBlank && textUpToBlank.length > 0, `Spoken text for blank ${bIdx} must not be empty`);
      // Must not read the blank word or brackets before the child fills it in
      assert.ok(!textUpToBlank.includes('[['), 'Must not contain [[');
      assert.ok(!textUpToBlank.includes(']]'), 'Must not contain ]]');

      // Find paragraph index containing target blank
      const pIdx = parsed.parsedParagraphs.findIndex((p) => p.some((s) => s.type === 'blank' && s.blankIndex === bIdx));
      assert.ok(pIdx !== -1, `Blank ${bIdx} must belong to a paragraph`);

      // Ensure the text starts with the beginning of that paragraph
      const firstTextSeg = parsed.parsedParagraphs[pIdx].find((s) => s.type === 'text');
      if (firstTextSeg) {
        assert.ok(textUpToBlank.startsWith(firstTextSeg.text.trim().slice(0, 15)), 'Must begin at start of paragraph');
      }

      // Fill this blank for subsequent blanks in the same paragraph
      filled[bIdx] = targetBlank.correct;
    }
  }
});

test('clean word pronunciation extraction handles punctuation, trailing dots, and contractions', () => {
  const sampleWords = [
    { input: 'Space,', expected: 'Space' },
    { input: 'moon.', expected: 'moon' },
    { input: '"stars"', expected: 'stars' },
    { input: 'Teenieping\'s', expected: "Teenieping's" },
    { input: 'Look!', expected: 'Look' },
    { input: 'can\'t', expected: "can't" },
    { input: 'far...', expected: 'far' },
  ];

  for (const { input, expected } of sampleWords) {
    const clean = input.replace(/[^\w']/g, '').trim();
    assert.strictEqual(clean, expected);
  }
});

