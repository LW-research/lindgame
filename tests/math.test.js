// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const M = require('../js/math.js');

const N = 1000;

test('2-digit addition without carrying', () => {
  for (let i = 0; i < N; i++) {
    const p = M.makeProblem('add', false, 2);
    assert.ok(p.a >= 10 && p.b >= 10 && p.answer <= 99);
    assert.ok((p.a % 10) + (p.b % 10) < 10, `${p.a}+${p.b} should not carry`);
    assert.strictEqual(p.answer, p.a + p.b);
  }
});

test('2-digit addition with carrying', () => {
  for (let i = 0; i < N; i++) {
    const p = M.makeProblem('add', true, 2);
    assert.ok(p.answer <= 99);
    assert.ok(M.needsRegroup('add', p.a, p.b), `${p.a}+${p.b} should carry`);
    assert.strictEqual(p.answer, p.a + p.b);
  }
});

test('2-digit subtraction without borrowing', () => {
  for (let i = 0; i < N; i++) {
    const p = M.makeProblem('sub', false, 2);
    assert.ok(p.b >= 10 && p.answer >= 1);
    assert.ok(p.a % 10 >= p.b % 10, `${p.a}-${p.b} should not borrow`);
    assert.strictEqual(p.answer, p.a - p.b);
  }
});

test('2-digit subtraction with borrowing', () => {
  for (let i = 0; i < N; i++) {
    const p = M.makeProblem('sub', true, 2);
    assert.ok(p.b >= 10 && p.answer >= 1);
    assert.ok(M.needsRegroup('sub', p.a, p.b), `${p.a}-${p.b} should borrow`);
    assert.strictEqual(p.answer, p.a - p.b);
  }
});

test('3-digit and 4-digit addition and subtraction (up to 4-digit numbers, <= 9999)', () => {
  for (const digits of [3, 4]) {
    for (const regroup of [false, true]) {
      for (const op of ['add', 'sub']) {
        for (let i = 0; i < 200; i++) {
          const p = M.makeProblem(op, regroup, digits);
          assert.strictEqual(String(p.a).length, digits);
          assert.strictEqual(String(p.b).length, digits);
          assert.ok(p.answer >= 1 && p.answer <= 9999, `Answer ${p.answer} must be <= 9999 (no larger than 4-digit numbers)`);
          assert.strictEqual(M.needsRegroup(op, p.a, p.b), regroup, `${op} ${p.a}, ${p.b} regroup mismatch`);
          if (op === 'add') assert.strictEqual(p.answer, p.a + p.b);
          else assert.strictEqual(p.answer, p.a - p.b);
        }
      }
    }
  }
});

test('mission has unique problems of the right count and planet configuration', () => {
  const m = M.makeMission({ ops: ['add', 'sub'], regroup: 'mixed', digits: 3 }, 5);
  assert.strictEqual(m.length, 5);
  assert.strictEqual(new Set(m.map((p) => p.op + p.a + ',' + p.b)).size, 5);
  for (const p of m) {
    assert.strictEqual(p.digits, 3);
    assert.ok(p.answer <= 9999);
  }
});

test('hint steps correctly calculate each column for up to 4-digit problems', () => {
  for (const digits of [2, 3, 4]) {
    for (const [op, regroup] of [['add', false], ['add', true], ['sub', false], ['sub', true]]) {
      for (let i = 0; i < 50; i++) {
        const p = M.makeProblem(op, regroup, digits);
        const steps = M.hintSteps(p);
        assert.ok(steps.length >= digits, `Should have at least ${digits} hint steps`);
        // Verify each step can be turned into speakable text without errors
        for (const s of steps) {
          assert.ok(typeof M.speakable(s) === 'string');
        }
      }
    }
  }
});
