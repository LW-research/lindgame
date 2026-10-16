const test = require('node:test');
const assert = require('node:assert');
const RaceEngine = require('../js/race.js');
const MathEngine = require('../js/math.js');
const { WORD_LEVELS } = require('../js/data.js');

test('RaceEngine makeMathQuestion generates 4 unique choices with correct answer', () => {
  for (let i = 0; i < 20; i++) {
    const q = RaceEngine.makeMathQuestion(MathEngine);
    assert.strictEqual(q.category, 'math');
    assert.strictEqual(q.choices.length, 4);
    assert.strictEqual(typeof q.prompt, 'string');
    assert.strictEqual(typeof q.speechText, 'string');
    const correctCount = q.choices.filter((c) => c.isCorrect).length;
    assert.strictEqual(correctCount, 1);
    const chosen = q.choices.find((c) => c.isCorrect);
    assert.strictEqual(chosen.text, q.answer);
  }
});

test('RaceEngine makeReadingQuestion generates sight and picture questions with correct answer', () => {
  for (let i = 0; i < 20; i++) {
    const q = RaceEngine.makeReadingQuestion(WORD_LEVELS);
    assert.strictEqual(q.category, 'reading');
    assert.strictEqual(q.choices.length, 4);
    assert.strictEqual(typeof q.prompt, 'string');
    const correctCount = q.choices.filter((c) => c.isCorrect).length;
    assert.strictEqual(correctCount, 1);
  }
});

test('RaceEngine makeQuestion respects category selection', () => {
  const mathQ = RaceEngine.makeQuestion('math', MathEngine, WORD_LEVELS);
  assert.strictEqual(mathQ.category, 'math');

  const readingQ = RaceEngine.makeQuestion('reading', MathEngine, WORD_LEVELS);
  assert.strictEqual(readingQ.category, 'reading');

  const mixQ = RaceEngine.makeQuestion('mix', MathEngine, WORD_LEVELS);
  assert.ok(['math', 'reading'].includes(mixQ.category));
});

test('createRacers creates player and 3 distinct rival racers', () => {
  const playerChar = { id: 'heartsping', name: 'Heartsping', accent: '#ff6b9d', symbol: '💖' };
  const allCharacters = [
    playerChar,
    { id: 'gogoping', name: 'Gogoping', accent: '#3b82f6', symbol: '⚡' },
    { id: 'chachaping', name: 'Chachaping', accent: '#10b981', symbol: '🍀' },
    { id: 'lalaping', name: 'Lalaping', accent: '#a855f7', symbol: '🎵' },
  ];

  const racers = RaceEngine.createRacers(playerChar, allCharacters);
  assert.strictEqual(racers.length, 4);
  assert.strictEqual(racers[0].isPlayer, true);
  assert.strictEqual(racers[0].charId, 'heartsping');
  assert.strictEqual(racers.filter((r) => r.isPlayer).length, 1);
  assert.strictEqual(racers.filter((r) => !r.isPlayer).length, 3);
});

test('applyAnswerResult gives super boost on fast correct answer and penalty on wrong', () => {
  const racers = RaceEngine.createRacers();
  const player = racers[0];

  const fastRes = RaceEngine.applyAnswerResult(player, true, 2.0);
  assert.strictEqual(fastRes.type, 'super');
  assert.strictEqual(player.distance, 150);

  const wrongRes = RaceEngine.applyAnswerResult(player, false, 1.0);
  assert.strictEqual(wrongRes.type, 'miss');
  assert.strictEqual(player.distance, 150); // no extra distance
});

test('updateRace updates distances, calculates ranks, and detects finish line', () => {
  const racers = RaceEngine.createRacers();
  const state1 = RaceEngine.updateRace(racers, 1.0, 1.0);
  assert.strictEqual(state1.raceFinished, false);
  assert.ok(state1.playerRank >= 1 && state1.playerRank <= 4);

  // Boost player to finish
  racers[0].distance = 1000;
  const state2 = RaceEngine.updateRace(racers, 0.1, 2.0);
  assert.strictEqual(state2.raceFinished, true);
});

test('computeTelemetry calculates 6-speed gear, RPM percentage, slipstream drafting, and leader gap', () => {
  const racers = RaceEngine.createRacers();
  const player = racers[0];
  const rival = racers[1];

  // Put player 20m behind rival to trigger slipstream drafting
  rival.distance = 220;
  player.distance = 200;
  player.speed = 25; // 25 m/s = 90 km/h -> Gear 4

  const telemetry = RaceEngine.computeTelemetry(player, racers);
  assert.strictEqual(telemetry.gear, 4);
  assert.ok(telemetry.rpm >= 1800 && telemetry.rpm <= 8800);
  assert.ok(telemetry.rpmPct >= 12 && telemetry.rpmPct <= 100);
  assert.strictEqual(telemetry.drafting, true);
  assert.strictEqual(telemetry.gapToLeader, 20);
  assert.strictEqual(telemetry.remainingMeters, 800);
});

