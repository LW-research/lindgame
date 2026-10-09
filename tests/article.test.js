// Run with: node --test tests/article.test.js
const test = require('node:test');
const assert = require('node:assert');
const { parseArticle } = require('../js/data.js');
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
