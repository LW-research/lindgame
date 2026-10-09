// Run with: node --test tests/teenieping.test.js
const test = require('node:test');
const assert = require('node:assert');
const Teenieping = require('../js/teenieping.js');

test('Teenieping roster has all 6 official main characters with required attributes', () => {
  const { TEENIEPINGS } = Teenieping;
  assert.strictEqual(TEENIEPINGS.length, 6);

  const expectedIds = ['heartsping', 'lalaping', 'chachaping', 'gogoping', 'dadaping', 'happyping'];
  const ids = TEENIEPINGS.map((t) => t.id);
  assert.deepStrictEqual(ids, expectedIds);

  for (const t of TEENIEPINGS) {
    assert.ok(t.id && typeof t.id === 'string');
    assert.ok(t.name && typeof t.name === 'string');
    assert.ok(t.koreanName && typeof t.koreanName === 'string');
    assert.ok(t.accent && t.accent.startsWith('#'));
    assert.ok(t.symbol && typeof t.symbol === 'string');
    assert.ok(t.pitch >= 1.10 && t.pitch <= 1.45, `${t.name} pitch ${t.pitch} must be high sweet cartoon tone`);
    assert.ok(t.rate >= 0.80 && t.rate <= 1.05, `${t.name} rate ${t.rate} should be clear child-paced rate`);
    assert.ok(t.catchphrase && t.catchphrase.length > 5);
    assert.ok(t.greeting && t.greeting.length > 10);
    assert.ok(Array.isArray(t.cheers) && t.cheers.length >= 3);
    assert.ok(Array.isArray(t.hints) && t.hints.length >= 2);
    assert.ok(t.avatarSvg.includes('<svg') && t.avatarSvg.includes('</svg>'));
  }
});

test('Teenieping manager provides current leader and cheers', () => {
  const leader = Teenieping.getLeader();
  assert.ok(leader && leader.name);
  const cheer = Teenieping.cheer();
  assert.ok(typeof cheer === 'string' && cheer.length > 0);
  const hint = Teenieping.hint();
  assert.ok(typeof hint === 'string' && hint.length > 0);
});

test('switchLeader switches to a different character', () => {
  for (let i = 0; i < 20; i++) {
    const prev = Teenieping.getLeader();
    const next = Teenieping.switchLeader();
    assert.notStrictEqual(next.id, prev.id, 'New leader must be different from previous leader');
  }
});

test('switchLeader with specific target ID selects that character', () => {
  const chosen = Teenieping.switchLeader('happyping');
  assert.strictEqual(chosen.id, 'happyping');
  assert.strictEqual(Teenieping.getLeader().id, 'happyping');
});

test('stepQuestion automatically triggers a tag-team switch every 3 questions', () => {
  // Reset to a known character
  Teenieping.switchLeader('heartsping');
  const currentId = Teenieping.getLeader().id;

  // Question 1: no switch
  const switch1 = Teenieping.stepQuestion();
  assert.strictEqual(switch1, false);
  assert.strictEqual(Teenieping.getLeader().id, currentId);

  // Question 2: no switch
  const switch2 = Teenieping.stepQuestion();
  assert.strictEqual(switch2, false);
  assert.strictEqual(Teenieping.getLeader().id, currentId);

  // Question 3: automatic switch triggers!
  const switch3 = Teenieping.stepQuestion();
  assert.strictEqual(switch3, true);
  assert.notStrictEqual(Teenieping.getLeader().id, currentId);
});

test('onChange listener is notified of switch events', () => {
  let switchEventData = null;
  const unsubscribe = Teenieping.manager.onChange((event, data) => {
    if (event === 'switch') switchEventData = data;
  });

  const next = Teenieping.switchLeader();
  assert.ok(switchEventData != null);
  assert.strictEqual(switchEventData.next.id, next.id);
  assert.ok(switchEventData.prev && switchEventData.prev.id);

  unsubscribe();
});
