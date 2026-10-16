const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { WORD_LEVELS } = require('../js/data.js');
const MathEngine = require('../js/math.js');
const RaceEngine = require('../js/race.js');
const PlatformerEngine = require('../js/platformer.js');

const HERO_CHAR = {
  id: 'heartsping',
  name: 'Heartsping',
  accent: '#ff6b9d',
  symbol: '💖',
};

describe('PlatformerEngine (Super Jump Run — Super Mario style game)', () => {
  it('initializes run state with 8 checkpoints, world metadata, and obstacle course', () => {
    const state = PlatformerEngine.createRunState(HERO_CHAR, 1);
    assert.equal(state.checkpoint, 0);
    assert.equal(state.totalCheckpoints, 8);
    assert.equal(state.coins, 0);
    assert.equal(state.score, 0);
    assert.equal(state.powerUp, 'normal');
    assert.equal(state.finished, false);
    assert.equal(state.world.id, '1-2');
    assert.equal(state.obstacles.length, 8);
  });

  it('delegates question generation to existing MathEngine, WORD_LEVELS, and RaceEngine', () => {
    const mathQ = PlatformerEngine.makeBlockQuestion('math', MathEngine, WORD_LEVELS, RaceEngine);
    assert.equal(mathQ.category, 'math');
    assert.equal(mathQ.badge, '🧱 [?] MATH BLOCK');
    assert.ok(Array.isArray(mathQ.choices));
    assert.equal(mathQ.choices.length, 4);
    assert.equal(mathQ.choices.filter((c) => c.isCorrect).length, 1);

    const readQ = PlatformerEngine.makeBlockQuestion('reading', MathEngine, WORD_LEVELS, RaceEngine);
    assert.equal(readQ.category, 'reading');
    assert.equal(readQ.badge, '🧱 [?] WORD BLOCK');
    assert.equal(readQ.choices.length, 4);
    assert.equal(readQ.choices.filter((c) => c.isCorrect).length, 1);
  });

  it('awards coins, score, and Super Mushroom / Super Star power-ups on correct jumps', () => {
    const state = PlatformerEngine.createRunState(HERO_CHAR, 0);

    // 1st calm jump (>3.5s) -> +1 coin, +100 score, normal power
    const res1 = PlatformerEngine.applyJumpResult(state, true, 4.2);
    assert.equal(state.checkpoint, 1);
    assert.equal(res1.bonusCoins, 1);
    assert.equal(res1.bonusScore, 100);
    assert.equal(state.powerUp, 'normal');
    assert.equal(res1.action, 'super-jump');

    // 2nd jump (streak 2, fast) -> earns Super Mushroom!
    const res2 = PlatformerEngine.applyJumpResult(state, true, 1.8);
    assert.equal(state.checkpoint, 2);
    assert.equal(state.powerUp, 'mushroom');
    assert.equal(res2.powerUpEarned, '🍄 SUPER MUSHROOM');
    assert.equal(res2.bonusCoins, 3);
    assert.equal(res2.bonusScore, 300);

    // 3rd jump (streak 3) -> earns Super Star!
    const res3 = PlatformerEngine.applyJumpResult(state, true, 1.6);
    assert.equal(state.streak, 3);
    assert.equal(state.powerUp, 'star');
    assert.equal(res3.powerUpEarned, '🌟 SUPER STAR');
    assert.equal(res3.action, 'star-leap');
  });

  it('shrinks power-up on wrong answer and keeps hero at current obstacle (pipe-bump)', () => {
    const state = PlatformerEngine.createRunState(HERO_CHAR, 0);
    PlatformerEngine.applyJumpResult(state, true, 1.5);
    assert.equal(state.powerUp, 'mushroom');
    assert.equal(state.checkpoint, 1);

    const wrongRes = PlatformerEngine.applyJumpResult(state, false, 4.0);
    assert.equal(wrongRes.action, 'pipe-bump');
    assert.equal(wrongRes.lostPower, true);
    assert.equal(state.checkpoint, 1); // Does not advance on wrong answer
    assert.equal(state.powerUp, 'normal'); // Downgraded from mushroom to normal
    assert.equal(state.streak, 0);
  });

  it('triggers flagpole-win when clearing the 8th checkpoint', () => {
    const state = PlatformerEngine.createRunState(HERO_CHAR, 2);
    let lastRes = null;
    for (let i = 0; i < PlatformerEngine.TOTAL_CHECKPOINTS; i++) {
      lastRes = PlatformerEngine.applyJumpResult(state, true, 2.5);
    }
    assert.equal(state.checkpoint, 8);
    assert.equal(state.finished, true);
    assert.equal(lastRes.finished, true);
    assert.equal(lastRes.action, 'flagpole-win');
  });

  it('renders a valid side-scrolling Mario stage SVG with Mystery Blocks, pipes, hero, and flagpole', () => {
    const state = PlatformerEngine.createRunState(HERO_CHAR, 0);
    const svg = PlatformerEngine.renderStageSvg(state, 'super-jump');
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('mario-stage-svg'));
    assert.ok(svg.includes('mario-block-pop'));
    assert.ok(svg.includes('mario-hero-sprite'));
    assert.ok(svg.includes(HERO_CHAR.symbol));
  });
});
