/* Teenieping Turbo Racing Engine
   Generates fast math and reading questions from existing curricula and
   manages racer state, speed physics, and race rankings.
   Compatible with browser (window.RaceEngine) and Node.js (module.exports). */
(function (root) {
  'use strict';

  const TRACK_LENGTH = 1000; // Total race distance in meters

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ---------- Question Generators ----------

  function makeMathQuestion(MathEngine) {
    const op = Math.random() < 0.55 ? 'add' : 'sub';
    // 1-digit or simple 2-digit arithmetic for fast mental math
    const digits = Math.random() < 0.5 ? 1 : 2;
    let prob;
    if (MathEngine && typeof MathEngine.makeProblem === 'function') {
      prob = MathEngine.makeProblem(op, false, digits);
    } else {
      // Fallback if MathEngine not loaded in test
      const a = digits === 1 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 40) + 10;
      const b = digits === 1 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 20) + 1;
      const ans = op === 'add' ? a + b : Math.max(1, a - b);
      prob = { op, a: op === 'sub' ? Math.max(a, b) : a, b: op === 'sub' ? Math.min(a, b) : b, answer: ans };
    }

    const correct = prob.answer;
    const distractorSet = new Set([correct]);
    const offsets = [-2, -1, 1, 2, -10, 10, 3, -3];
    shuffle(offsets);
    for (const off of offsets) {
      const cand = correct + off;
      if (cand > 0 && !distractorSet.has(cand)) distractorSet.add(cand);
      if (distractorSet.size >= 4) break;
    }
    while (distractorSet.size < 4) {
      const cand = Math.max(1, correct + Math.floor(Math.random() * 10) - 5);
      distractorSet.add(cand);
    }

    const choices = shuffle(Array.from(distractorSet));
    const opSymbol = prob.op === 'add' ? '+' : '−';
    const opWord = prob.op === 'add' ? 'plus' : 'minus';

    return {
      category: 'math',
      prompt: `${prob.a} ${opSymbol} ${prob.b} = ?`,
      speechText: `${prob.a} ${opWord} ${prob.b} equals what?`,
      choices: choices.map((val) => ({ text: String(val), isCorrect: val === correct })),
      answer: String(correct),
      answerIndex: choices.indexOf(correct),
    };
  }

  function makeReadingQuestion(wordLevels) {
    const levels = wordLevels || (typeof WORD_LEVELS !== 'undefined' ? WORD_LEVELS : null);
    const subType = Math.random() < 0.5 ? 'picture' : 'sight';

    if (subType === 'picture' && levels && levels[0]?.pictures) {
      const allPics = levels.flatMap((lvl) => lvl.pictures);
      const target = pick(allPics);
      const pool = allPics.filter((p) => p[0] !== target[0]);
      const distractors = shuffle(pool).slice(0, 3);
      const choices = shuffle([target, ...distractors]).map((item) => ({
        text: `${item[1]} ${item[0]}`,
        value: item[0],
        isCorrect: item[0] === target[0],
      }));

      return {
        category: 'reading',
        prompt: `Which one is "${target[0]}"?`,
        speechText: `Which picture is ${target[0]}?`,
        choices,
        answer: target[0],
        answerIndex: choices.findIndex((c) => c.isCorrect),
      };
    }

    // Sight word find
    const allSight = (levels && levels.flatMap((lvl) => lvl.sight)) || [
      'jump', 'run', 'play', 'blue', 'red', 'look', 'come', 'help', 'good', 'find',
    ];
    const targetWord = pick(allSight);
    const pool = allSight.filter((w) => w !== targetWord);
    const distractors = shuffle(pool).slice(0, 3);
    const choices = shuffle([targetWord, ...distractors]).map((w) => ({
      text: w,
      isCorrect: w === targetWord,
    }));

    return {
      category: 'reading',
      prompt: `Tap the word: "${targetWord}"`,
      speechText: `Tap the word ${targetWord}!`,
      choices,
      answer: targetWord,
      answerIndex: choices.findIndex((c) => c.isCorrect),
    };
  }

  function makeQuestion(category = 'mix', MathEngine, wordLevels) {
    if (category === 'math') return makeMathQuestion(MathEngine);
    if (category === 'reading') return makeReadingQuestion(wordLevels);
    // mix
    return Math.random() < 0.5 ? makeMathQuestion(MathEngine) : makeReadingQuestion(wordLevels);
  }

  // ---------- Racer Initialization ----------

  function createRacers(playerCharacter, allCharacters) {
    const playerChar = playerCharacter || {
      id: 'heartsping',
      name: 'Heartsping',
      accent: '#ff6b9d',
      symbol: '💖',
    };

    const roster = (allCharacters || []).filter((c) => c.id !== playerChar.id);
    const rivalChoices = shuffle(roster.length >= 3 ? roster : [
      { id: 'gogoping', name: 'Gogoping', accent: '#3b82f6', symbol: '⚡' },
      { id: 'chachaping', name: 'Chachaping', accent: '#10b981', symbol: '🍀' },
      { id: 'lalaping', name: 'Lalaping', accent: '#a855f7', symbol: '🎵' },
      { id: 'happyping', name: 'Happyping', accent: '#f59e0b', symbol: '🎈' },
    ]).slice(0, 3);

    const kartThemes = [
      { kartName: 'Star Cruiser', baseSpeed: 19.5, speedVariance: 2.5, cornerSkill: 1.05 },
      { kartName: 'Thunder Bolt', baseSpeed: 17.5, speedVariance: 2.0, cornerSkill: 1.0 },
      { kartName: 'Clover Dart', baseSpeed: 15.5, speedVariance: 2.0, cornerSkill: 0.96 },
    ];

    const racers = [
      {
        id: 'player',
        charId: playerChar.id,
        name: playerChar.name,
        symbol: playerChar.symbol || '💖',
        accent: playerChar.accent || '#ff6b9d',
        kartName: `${playerChar.name} Turbo`,
        isPlayer: true,
        distance: 0,
        visualDistance: 0,
        speed: 12, // cruising base m/s
        targetSpeed: 13.5,
        boostTime: 0,
        boostTier: 'none',
        gear: 2,
        rpm: 3800,
        drafting: false,
        streak: 0,
        finished: false,
        finishTime: null,
      },
      ...rivalChoices.map((c, i) => ({
        id: `rival_${c.id}`,
        charId: c.id,
        name: c.name,
        symbol: c.symbol || '🏎️',
        accent: c.accent || '#818cf8',
        kartName: kartThemes[i].kartName,
        isPlayer: false,
        distance: 0,
        visualDistance: 0,
        speed: kartThemes[i].baseSpeed,
        baseSpeed: kartThemes[i].baseSpeed,
        speedVariance: kartThemes[i].speedVariance,
        boostTime: 0,
        finished: false,
        finishTime: null,
      })),
    ];

    return racers;
  }

  function computeTelemetry(player, racers) {
    if (!player) {
      return {
        speedKmH: 0,
        gear: 1,
        rpm: 2000,
        rpmPct: 20,
        drafting: false,
        gapToLeader: 0,
        remainingMeters: TRACK_LENGTH,
        gapText: '0m',
      };
    }
    const speedKmH = Math.round(player.speed * 3.6);
    const gearThresholds = [0, 35, 55, 78, 102, 125];
    let gear = 1;
    for (let g = gearThresholds.length - 1; g >= 0; g--) {
      if (speedKmH >= gearThresholds[g]) {
        gear = g + 1;
        break;
      }
    }
    gear = Math.min(6, Math.max(1, gear));
    const low = gearThresholds[gear - 1] || 0;
    const high = gearThresholds[gear] || 155;
    const gearFrac = Math.min(1, Math.max(0, (speedKmH - low) / Math.max(1, high - low)));
    const rpm = Math.round(3200 + gearFrac * 5200);
    const rpmPct = Math.min(100, Math.max(12, Math.round(((rpm - 2000) / 6800) * 100)));

    const isDrafting = Array.isArray(racers)
      ? racers.some(
          (other) =>
            other.id !== player.id &&
            other.distance > player.distance + 4 &&
            other.distance - player.distance <= 42
        )
      : !!player.drafting;

    let gapText = 'LEADING';
    let gapToLeader = 0;
    if (Array.isArray(racers) && racers.length > 1) {
      const sorted = racers.slice().sort((a, b) => b.distance - a.distance);
      if (sorted[0].id === player.id) {
        const aheadBy = Math.max(0, Math.round(player.distance - sorted[1].distance));
        gapToLeader = 0;
        gapText = `+${aheadBy}m LEAD`;
      } else {
        const behindBy = Math.max(1, Math.round(sorted[0].distance - player.distance));
        gapToLeader = behindBy;
        gapText = `-${behindBy}m GAP`;
      }
    }

    const remainingMeters = Math.max(0, Math.round(TRACK_LENGTH - player.distance));

    return {
      speedKmH,
      gear,
      rpm,
      rpmPct,
      drafting: isDrafting,
      gapToLeader,
      remainingMeters,
      gapText,
    };
  }

  // ---------- Physics / Tick Update ----------

  function updateRace(racers, dtSeconds, elapsedSeconds) {
    let raceFinished = false;
    const player = racers.find((r) => r.isPlayer);

    // Check slipstream drafting for player (within 6m..42m behind any rival)
    if (player && !player.finished) {
      player.drafting = racers.some(
        (other) =>
          !other.isPlayer &&
          other.distance > player.distance + 4 &&
          other.distance - player.distance <= 42
      );
    }

    racers.forEach((r, idx) => {
      if (r.finished) return;

      if (r.isPlayer) {
        if (r.boostTime > 0) {
          r.boostTime -= dtSeconds;
          // Realistic aerodynamic drag decay while boosting
          const cruise = (r.targetSpeed || 13.5) + (r.drafting ? 2.4 : 0);
          r.speed = Math.max(cruise, r.speed - dtSeconds * 4.5);
          if (r.boostTime <= 0) {
            r.boostTime = 0;
            r.boostTier = 'none';
            r.speed = cruise;
          }
        } else {
          const desired = (r.targetSpeed || 13.5) + (r.drafting ? 2.4 : 0);
          r.speed += (desired - r.speed) * Math.min(1, dtSeconds * 3.5);
        }
        r.distance += r.speed * dtSeconds;
      } else {
        // Rivals have realistic cornering wave + occasional mini-turbo surges
        const wave = Math.sin(elapsedSeconds * 1.6 + idx * 1.9) * r.speedVariance * 0.45;
        const surgeCycle = Math.sin(elapsedSeconds * 0.65 + idx * 2.3);
        const isSurging = surgeCycle > 0.78;
        r.boostTime = isSurging ? 0.5 : 0;
        const surgeBonus = isSurging ? 3.2 : 0;
        const currentSpeed = Math.max(10, r.baseSpeed + wave + surgeBonus);
        r.distance += currentSpeed * dtSeconds;
        r.speed = currentSpeed;
      }

      if (r.distance >= TRACK_LENGTH) {
        r.distance = TRACK_LENGTH;
        r.finished = true;
        r.finishTime = elapsedSeconds;
      }

      // Smoothly interpolate visualDistance toward logical distance for realistic motion
      if (typeof r.visualDistance !== 'number') {
        r.visualDistance = r.distance;
      } else {
        const diff = r.distance - r.visualDistance;
        if (diff > 0.5) {
          // Smooth high-velocity catchup so boost surges glide across the track
          r.visualDistance += Math.min(diff, Math.max(r.speed * 1.35, diff * 4.2) * dtSeconds);
        } else {
          r.visualDistance = r.distance;
        }
        r.visualDistance = Math.min(TRACK_LENGTH, r.visualDistance);
      }
    });

    if (player && player.finished) {
      raceFinished = true;
    }

    // Rank racers by distance
    const standings = racers.slice().sort((a, b) => b.distance - a.distance);
    standings.forEach((r, rankIndex) => {
      r.currentRank = rankIndex + 1;
    });

    const telemetry = computeTelemetry(player, racers);
    if (player) {
      player.gear = telemetry.gear;
      player.rpm = telemetry.rpm;
    }

    return {
      racers,
      standings,
      playerRank: player ? player.currentRank : 1,
      playerDistance: player ? player.distance : 0,
      playerVisualDistance: player ? player.visualDistance : 0,
      telemetry,
      raceFinished,
      trackLength: TRACK_LENGTH,
    };
  }

  // Apply Answer Result: returns boost details
  function applyAnswerResult(playerRacer, isCorrect, answerDurationSeconds) {
    if (!playerRacer) return null;

    if (!isCorrect) {
      // Wrong answer: tire slip / engine hiccup
      playerRacer.speed = 6.5;
      playerRacer.boostTime = 1.2;
      playerRacer.boostTier = 'miss';
      playerRacer.streak = 0;
      return {
        type: 'miss',
        label: '⚠️ Tire Slip! Engine Hiccup!',
        boostMeters: 0,
        speedKmH: 23,
      };
    }

    playerRacer.streak = (playerRacer.streak || 0) + 1;

    if (answerDurationSeconds <= 3.2) {
      // Super Turbo!
      const boostMeters = 150;
      if (typeof playerRacer.visualDistance !== 'number') {
        playerRacer.visualDistance = playerRacer.distance;
      }
      playerRacer.distance = Math.min(TRACK_LENGTH, playerRacer.distance + boostMeters);
      playerRacer.speed = 38;
      playerRacer.boostTime = 2.6;
      playerRacer.boostTier = 'super';
      return {
        type: 'super',
        label: '🚀 SUPER NITRO OVERDRIVE! 💨',
        boostMeters,
        speedKmH: 137,
      };
    } else if (answerDurationSeconds <= 6.5) {
      // Turbo Boost!
      const boostMeters = 95;
      if (typeof playerRacer.visualDistance !== 'number') {
        playerRacer.visualDistance = playerRacer.distance;
      }
      playerRacer.distance = Math.min(TRACK_LENGTH, playerRacer.distance + boostMeters);
      playerRacer.speed = 28;
      playerRacer.boostTime = 2.1;
      playerRacer.boostTier = 'turbo';
      return {
        type: 'turbo',
        label: '⚡ TURBO BOOST! ⚡',
        boostMeters,
        speedKmH: 101,
      };
    } else {
      // Steady progress
      const boostMeters = 55;
      if (typeof playerRacer.visualDistance !== 'number') {
        playerRacer.visualDistance = playerRacer.distance;
      }
      playerRacer.distance = Math.min(TRACK_LENGTH, playerRacer.distance + boostMeters);
      playerRacer.speed = 21;
      playerRacer.boostTime = 1.6;
      playerRacer.boostTier = 'normal';
      return {
        type: 'normal',
        label: '🏎️ Clean Shift! Keep rolling!',
        boostMeters,
        speedKmH: 76,
      };
    }
  }

  const RaceEngine = {
    TRACK_LENGTH,
    makeMathQuestion,
    makeReadingQuestion,
    makeQuestion,
    createRacers,
    computeTelemetry,
    updateRace,
    applyAnswerResult,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RaceEngine;
  }
  if (typeof root !== 'undefined') {
    root.RaceEngine = RaceEngine;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
