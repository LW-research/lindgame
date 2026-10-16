/* Star Rocket Academy – screens, game flow, progress. */
(() => {
  'use strict';

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const STORE_KEY = 'starRocket.v1';
  const dialog = $('#reward-dialog');

  // ---------- Saved progress ----------
  const DEFAULTS = { stars: 0, best: {}, voice: true, readArticles: {} };
  const state = load();
  function load() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; }
    catch { return { ...DEFAULTS }; }
  }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  // ---------- Little helpers ----------
  const opSign = (p) => (p.op === 'add' ? '+' : '−');
  const opWord = (p) => (p.op === 'add' ? 'plus' : 'minus');
  const unlockedCount = (stars = state.stars) => PLANETS.filter((p) => stars >= p.starsNeeded).length;

  function replayClass(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // restart CSS animation
    el.classList.add(cls);
  }

  function confetti(count = 36) {
    if (reduceMotion.matches) return;
    const box = document.createElement('div');
    box.className = 'confetti';
    const colors = ['#ffd166', '#ff7a8a', '#4be3b0', '#6ec8ff', '#c3a6ff'];
    for (let i = 0; i < count; i++) {
      const bit = document.createElement('i');
      bit.style.cssText = `--x:${Math.random() * 100}vw;--dx:${(Math.random() - 0.5) * 30}vw;` +
        `--r:${Math.random() * 720}deg;--c:${pick(colors)};--t:${1.3 + Math.random()}s;--delay:${Math.random() * 0.3}s`;
      box.append(bit);
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 2800);
  }

  function makeSky() {
    const sky = $('.sky');
    for (let i = 0; i < 90; i++) {
      const s = document.createElement('span');
      s.className = 'twinkle';
      s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
        `--s:${(Math.random() * 2.5 + 1).toFixed(1)}px;--d:${(Math.random() * 3 + 2).toFixed(1)}s;--delay:${(-Math.random() * 5).toFixed(1)}s`;
      sky.append(s);
    }
  }

  // ---------- Screens (View Transitions with fallback) ----------
  let currentScreen = 'home';
  function showScreen(name) {
    if (name !== 'race' && typeof stopRaceMode === 'function') stopRaceMode();
    if (name !== 'tetris' && typeof stopTetrisMode === 'function') stopTetrisMode();
    if (typeof TeeniepingAudio !== 'undefined') TeeniepingAudio.stop();
    Speech.stop();
    const update = () => {
      $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
      currentScreen = name;
      refreshStars();
      window.scrollTo(0, 0);
    };
    const focus = () => $(`[data-screen="${name}"] h1, [data-screen="${name}"] h2`)?.focus({ preventScroll: true });
    if (!document.startViewTransition || reduceMotion.matches) { update(); focus(); return; }
    document.startViewTransition(update).finished.finally(focus);
  }

  // ---------- Stars & fuel ----------
  function refreshStars() {
    $$('.js-stars').forEach((el) => { el.textContent = state.stars; });
    const next = PLANETS.find((p) => state.stars < p.starsNeeded);
    let pct = 100;
    let label = 'All planets open! You are a super star pilot! 🌟';
    if (next) {
      const prev = PLANETS[PLANETS.indexOf(next) - 1].starsNeeded;
      pct = ((state.stars - prev) / (next.starsNeeded - prev)) * 100;
      const need = next.starsNeeded - state.stars;
      label = `${need} more ⭐ to fly to ${next.name}!`;
    }
    $('#fuel-fill').style.width = `${Math.max(4, pct)}%`;
    $('#fuel-bar').setAttribute('aria-valuenow', Math.round(pct));
    $('#fuel-label').textContent = label;
  }

  function addStar() {
    state.stars++;
    save();
    refreshStars();
    $$('.star-badge').forEach((b) => replayClass(b, 'pop'));
  }

  // ---------- Catch! Teenieping Leader Companion & Voice Profile ----------
  function updateTeeniepingCompanion(leader) {
    if (!leader) return;
    const frame = $('#tp-avatar-frame');
    if (frame) frame.innerHTML = leader.avatarSvg;
    const nameEl = $('#tp-bubble-name');
    if (nameEl) nameEl.textContent = leader.name;
    const korEl = $('#tp-bubble-korean');
    if (korEl) korEl.textContent = leader.koreanName;
    const symEl = $('#tp-bubble-symbol');
    if (symEl) symEl.textContent = leader.symbol;
    const hintEl = $('#tp-switch-hint');
    if (hintEl) hintEl.textContent = `${leader.symbol} Leader`;
    document.documentElement.style.setProperty('--tp-accent', leader.accent);
    document.documentElement.style.setProperty('--tp-glow', leader.bgGlow);
  }

  function setTeeniepingSpeech(text, speak = false, clipType = null) {
    if (typeof Teenieping === 'undefined') return;
    const leader = Teenieping.getLeader();
    const bubbleText = $('#tp-bubble-text');
    if (bubbleText) bubbleText.textContent = text;
    const comp = $('#tp-companion');
    if (comp) replayClass(comp, 'cheering');
    if (speak) {
      if (clipType && typeof TeeniepingAudio !== 'undefined') {
        const played = TeeniepingAudio.playClip(leader.id, clipType, () => {});
        if (played) return;
      }
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(text, { charId: leader.id });
      } else {
        Speech.say(text, { pitch: leader.pitch, rate: leader.rate });
      }
    }
  }

  function cheerWithTeenieping(extraMsg = '') {
    if (typeof Teenieping === 'undefined') return;
    const leader = Teenieping.getLeader();
    const cheer = Teenieping.cheer();
    const bubbleText = $('#tp-bubble-text');
    if (bubbleText) bubbleText.textContent = cheer;
    const comp = $('#tp-companion');
    if (comp) replayClass(comp, 'cheering');

    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.playCheerWithSpeech(leader.id, extraMsg, { pitch: leader.pitch, rate: leader.rate });
    } else {
      const fullSpeech = extraMsg ? `${cheer} ${extraMsg}` : cheer;
      Speech.say(fullSpeech, { pitch: leader.pitch, rate: leader.rate });
    }
  }

  let bannerTimer = null;
  function showTagBanner(prev, next) {
    const banner = $('#tp-tag-banner');
    if (!banner) return;
    const badge = $('#tp-banner-badge');
    if (badge) badge.innerHTML = next.avatarSvg;
    const textEl = $('#tp-banner-text');
    if (textEl) textEl.textContent = `${prev.name} tagged in ${next.name}! ${next.symbol}`;

    updateTeeniepingCompanion(next);
    setTeeniepingSpeech(next.greeting, false);

    banner.hidden = false;
    replayClass(banner, 'tp-tag-banner');
    Sound.tap();

    if (typeof TeeniepingAudio !== 'undefined') {
      const played = TeeniepingAudio.playTag(next.id, () => {});
      if (!played) {
        TeeniepingAudio.speakText(`${prev.name} tagged in ${next.name}! ${next.greeting}`, {
          charId: next.id,
        });
      }
    } else {
      Speech.say(`${prev.name} tagged in ${next.name}! ${next.greeting}`, {
        pitch: next.pitch,
        rate: next.rate,
      });
    }

    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      banner.hidden = true;
    }, 3600);
  }

  function initTeenieping() {
    if (typeof Teenieping === 'undefined') return;
    const leader = Teenieping.getLeader();
    updateTeeniepingCompanion(leader);
    setTeeniepingSpeech(leader.catchphrase, false);

    Teenieping.manager.onChange((event, data) => {
      if (event === 'switch') {
        showTagBanner(data.prev, data.next);
      }
    });

    $('#tp-avatar-btn')?.addEventListener('click', () => {
      Sound.tap();
      const leader = Teenieping.getLeader();
      setTeeniepingSpeech(leader.catchphrase, true, 'catchphrase');
    });

    $('#tp-speech-bubble')?.addEventListener('click', () => {
      Sound.tap();
      const leader = Teenieping.getLeader();
      setTeeniepingSpeech(leader.catchphrase, true, 'catchphrase');
    });

    function renderCharacterPicker() {
      const currentLeader = Teenieping.getLeader();
      const grid = $('#tp-picker-grid');
      if (!grid) return;
      grid.innerHTML = Teenieping.TEENIEPINGS.map((char) => {
        const isCurrent = char.id === currentLeader.id;
        return `
          <button class="tp-picker-card ${isCurrent ? 'active' : ''}" data-char-id="${char.id}" style="--char-accent: ${char.accent}; --char-glow: ${char.bgGlow};" aria-label="Select ${char.name} (${char.koreanName})">
            ${isCurrent ? '<span class="tp-picker-active-badge">⭐ Leading Now</span>' : ''}
            <div class="tp-picker-avatar-frame">${char.avatarSvg}</div>
            <div class="tp-picker-info">
              <strong class="tp-picker-name">${char.name} <span class="tp-picker-korean">${char.koreanName}</span></strong>
              <span class="tp-picker-symbol">${char.symbol} ${char.title}</span>
              <p class="tp-picker-quote">"${char.catchphrase}"</p>
            </div>
          </button>
        `;
      }).join('');
    }

    $('#btn-switch-tp')?.addEventListener('click', () => {
      Sound.tap();
      renderCharacterPicker();
      $('#tp-picker-dialog')?.showModal();
    });

    $('#btn-close-tp-picker')?.addEventListener('click', () => {
      $('#tp-picker-dialog')?.close();
    });

    $('#tp-picker-dialog')?.addEventListener('click', (e) => {
      if (e.target.id === 'tp-picker-dialog') {
        $('#tp-picker-dialog')?.close();
      }
    });

    $('#tp-picker-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.tp-picker-card');
      if (!card) return;
      const charId = card.dataset.charId;
      Sound.tap();
      $('#tp-picker-dialog')?.close();
      if (charId) {
        Teenieping.switchLeader(charId);
      }
    });

    $('#btn-tp-random')?.addEventListener('click', () => {
      Sound.tap();
      $('#tp-picker-dialog')?.close();
      Teenieping.switchLeader();
    });
  }

  // ---------- Reward dialog ----------
  let onRewardClose = null;
  function showReward({ emoji, title, text, earned, total, onClose }) {
    $('#reward-emoji').textContent = emoji;
    $('#reward-title').textContent = title;
    $('#reward-text').textContent = text;
    $('#reward-stars').innerHTML = Array.from({ length: total }, (_, i) =>
      `<span class="rs ${i < earned ? 'on' : ''}" style="--i:${i}">★</span>`).join('');
    $('#reward-stars').setAttribute('aria-label', `${earned} out of ${total} stars`);
    onRewardClose = onClose;
    dialog.showModal();
    Sound.win();
    confetti(60);
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.speakText(`${title} ${text}`, {
        charId: leader ? leader.id : 'heartsping',
      });
    } else {
      Speech.say(`${title} ${text}`, {
        pitch: leader ? leader.pitch : 1.25,
        rate: leader ? leader.rate : 0.88,
      });
    }
  }
  dialog.addEventListener('close', () => { const fn = onRewardClose; onRewardClose = null; fn?.(); });
  $('#reward-ok').addEventListener('click', () => dialog.close());

  // ---------- Planet map ----------
  function renderMap() {
    $('#planet-path').innerHTML = PLANETS.map((p, i) => {
      const locked = state.stars < p.starsNeeded;
      const best = state.best[p.id];
      return `<li class="planet-stop">
        <button class="planet-btn ${locked ? 'locked' : ''}" data-idx="${i}" id="planet-${p.id}" ${locked ? 'aria-disabled="true"' : ''}>
          <span class="planet planet-${p.id}" aria-hidden="true">${locked ? '<span class="lock">🔒</span>' : ''}</span>
          <span class="planet-name">${p.name}</span>
          <span class="planet-sub">${locked ? `Need ${p.starsNeeded} ⭐` : p.label}</span>
          ${best != null ? `<span class="planet-best">Best: ${best}/${MISSION_LENGTH} ⭐</span>` : ''}
        </button></li>`;
    }).join('');
  }

  $('#planet-path').addEventListener('click', (e) => {
    const btn = e.target.closest('.planet-btn');
    if (!btn) return;
    const planet = PLANETS[Number(btn.dataset.idx)];
    if (btn.classList.contains('locked')) {
      Sound.wrong();
      replayClass(btn, 'shake');
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(`You need ${planet.starsNeeded} stars to fly to ${planet.name}.`, {
          charId: leader ? leader.id : 'heartsping',
        });
      } else {
        Speech.say(`You need ${planet.starsNeeded} stars to fly to ${planet.name}.`);
      }
      return;
    }
    Sound.tap();
    startMission(Number(btn.dataset.idx));
  });

  // ---------- Math mission ----------
  // digits[i] is the child's digit for place i (0 = ones, 1 = tens, 2 = hundreds, 3 = thousands).
  const mission = { planet: null, problems: [], idx: 0, earned: 0, results: [], tries: 0, digits: [], slot: 0, locked: false };
  const PLACE_NAMES = MathEngine.PLACES;
  const answerDigits = (p) => MathEngine.digitsOf(p.answer);
  const currentProblem = () => mission.problems[mission.idx];

  function startMission(i) {
    const planet = PLANETS[i];
    Object.assign(mission, { planet, problems: MathEngine.makeMission(planet, MISSION_LENGTH), idx: 0, earned: 0, results: [] });
    $('#mission-title').textContent = planet.name;
    $('#screen-mission').style.setProperty('--accent', planet.accent);
    showScreen('mission');
    renderProblem();
  }

  function renderProgress(el, total, results, idx) {
    el.innerHTML = Array.from({ length: total }, (_, i) => {
      const cls = i < results.length ? (results[i] ? 'got' : 'miss') : i === idx ? 'now' : '';
      return `<span class="dot ${cls}"></span>`;
    }).join('');
  }

  function renderProblem() {
    const p = currentProblem();
    Object.assign(mission, { tries: 0, digits: Array(MathEngine.answerWidth(p)).fill(null), slot: 0, locked: false });
    const story = makeStory(p);
    mission.storyText = story.text;
    $('#story-emoji').textContent = story.emoji;
    renderStory(story.text);
    renderColumn(p);
    setFeedback('#feedback', '');
    $('#helper').hidden = true;
    renderProgress($('#mission-progress'), MISSION_LENGTH, mission.results, mission.idx);
  }

  // Every word is a button so the child can tap any word they can't read yet.
  function renderStory(text) {
    const el = $('#story-text');
    el.innerHTML = '';
    for (const m of text.matchAll(/\S+/g)) {
      const btn = document.createElement('button');
      btn.className = 'word';
      btn.textContent = m[0];
      btn.dataset.start = m.index;
      el.append(btn, ' ');
    }
  }

  $('#story-text').addEventListener('click', (e) => {
    const btn = e.target.closest('.word');
    if (!btn) return;
    clearSpeaking();
    btn.classList.add('speaking');
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.speakText(btn.textContent.replace(/[^\w']/g, ''), {
        charId: leader ? leader.id : 'heartsping',
        rate: 0.75,
        onEnd: () => btn.classList.remove('speaking'),
      });
    } else {
      Speech.say(btn.textContent.replace(/[^\w']/g, ''), { rate: 0.7, onEnd: () => btn.classList.remove('speaking') });
    }
  });

  function clearSpeaking() { $$('.word.speaking').forEach((w) => w.classList.remove('speaking')); }

  // Read-along: highlight each word while the sentence is spoken.
  $('#btn-read').addEventListener('click', () => {
    const words = $$('#story-text .word');
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    const boundaryHandler = (charIndex) => {
      let hit = words[0];
      for (const w of words) if (Number(w.dataset.start) <= charIndex) hit = w;
      clearSpeaking();
      hit?.classList.add('speaking');
    };

    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.speakText(mission.storyText, {
        charId: leader ? leader.id : 'heartsping',
        onBoundary: boundaryHandler,
        onEnd: clearSpeaking,
      });
    } else {
      Speech.say(mission.storyText, {
        pitch: leader ? leader.pitch : 1.25,
        rate: leader ? leader.rate : 0.88,
        onBoundary: boundaryHandler,
        onEnd: clearSpeaking,
      });
    }
  });

  // Column layout with one cell per place value, biggest place on the left, plus interactive carry/trade scratch row.
  function renderColumn(p) {
    const width = mission.digits.length;
    const places = Array.from({ length: width }, (_, k) => width - 1 - k); // e.g. [3, 2, 1, 0]
    const cells = (n) => {
      const d = MathEngine.digitsOf(n);
      return places.map((i) => `<span class="d p${i}">${d[i] ?? ''}</span>`).join('');
    };
    const carryCells = places.map((i) =>
      i > 0
        ? `<button type="button" class="carry-box p${i}" data-carry="${i}" title="Tap to mark carry or trade for ${PLACE_NAMES[i]}" aria-label="Carry or trade note for ${PLACE_NAMES[i]}"></button>`
        : `<span class="carry-spacer" aria-hidden="true"></span>`
    ).join('');
    const el = $('#column-sum');
    el.className = 'column-sum';
    el.style.setProperty('--cols', width);
    el.setAttribute('aria-label', `${p.a} ${opWord(p)} ${p.b}`);
    el.innerHTML = `
      <div class="col-head"><span></span>${places.map((i) => `<span class="p${i}">${PLACE_NAMES[i]}</span>`).join('')}</div>
      <div class="col-carry"><span class="carry-lbl" title="Tap boxes to note carries">✏️</span>${carryCells}</div>
      <div class="col-row"><span></span>${cells(p.a)}</div>
      <div class="col-row"><span class="op">${opSign(p)}</span>${cells(p.b)}</div>
      <div class="col-line"></div>
      <div class="col-row answer">
        <span class="op">=</span>
        ${places.map((i) => `<button class="slot" data-slot="${i}" aria-label="${PLACE_NAMES[i]} answer"></button>`).join('')}
      </div>`;
    renderSlots();
  }

  function renderSlots() {
    for (const s of $$('#column-sum .slot')) {
      const i = Number(s.dataset.slot);
      s.textContent = mission.digits[i] ?? '';
      s.classList.toggle('active', !mission.locked && mission.slot === i);
    }
  }

  $('#column-sum').addEventListener('click', (e) => {
    const carryBtn = e.target.closest('.carry-box');
    if (carryBtn && !mission.locked) {
      Sound.tap();
      const p = currentProblem();
      const states = p?.op === 'sub' ? ['', '−1', '+10'] : ['', '+1'];
      const cur = carryBtn.textContent.trim();
      const next = states[(states.indexOf(cur) + 1) % states.length];
      carryBtn.textContent = next;
      carryBtn.classList.toggle('marked', Boolean(next));
      return;
    }
    const s = e.target.closest('.slot');
    if (!s || mission.locked) return;
    mission.slot = Number(s.dataset.slot);
    renderSlots();
  });

  // Number pad: fills the ones first (like the column method), then moves left.
  function buildPad() {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
    $('#numpad').innerHTML = keys.map((k) => {
      if (k === 'del') return '<button class="key key-del" data-key="del" aria-label="Delete">⌫</button>';
      if (k === 'ok') return '<button class="key key-ok" data-key="ok" aria-label="Check answer">✔</button>';
      return `<button class="key" data-key="${k}">${k}</button>`;
    }).join('');
  }

  $('#numpad').addEventListener('click', (e) => {
    const key = e.target.closest('.key')?.dataset.key;
    if (key) pressKey(key);
  });

  function pressKey(key) {
    if (mission.locked) return;
    if (key === 'ok') return checkAnswer();
    Sound.tap();
    const d = mission.digits;
    if (key === 'del') {
      // Remove the left-most digit typed so far.
      let i = d.length - 1;
      while (i > 0 && d[i] == null) i--;
      d[i] = null;
      mission.slot = i;
    } else {
      d[mission.slot] = Number(key);
      if (mission.slot < d.length - 1) mission.slot++;
    }
    renderSlots();
  }

  function setFeedback(sel, text, kind = '') {
    const el = $(sel);
    el.textContent = text;
    el.className = `feedback ${kind}`;
  }

  function checkAnswer() {
    const p = currentProblem();
    const d = mission.digits;
    if (d[0] == null) {
      setFeedback('#feedback', 'Tap a number for the ones first! 👇', 'info');
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText('Tap a number for the ones first!', { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say('Tap a number for the ones first!');
      }
      return;
    }
    const value = d.reduce((sum, x, i) => sum + (x ?? 0) * 10 ** i, 0);
    if (value === p.answer) return onCorrect(p);
    onWrong(p);
  }

  function onCorrect(p) {
    mission.locked = true;
    const star = mission.tries < 2;
    mission.results.push(star);
    if (star) { mission.earned++; addStar(); }
    renderSlots();
    $('#column-sum').classList.add('solved');
    Sound.correct();
    confetti();
    const switched = typeof Teenieping !== 'undefined' ? Teenieping.stepQuestion() : false;
    const praise = typeof Teenieping !== 'undefined' ? Teenieping.cheer() : pick(PRAISE);
    setFeedback('#feedback', `${praise} ${p.a} ${opSign(p)} ${p.b} = ${p.answer} ${star ? '⭐' : ''}`, 'good');
    renderProgress($('#mission-progress'), MISSION_LENGTH, mission.results, mission.idx);
    if (!switched) {
      cheerWithTeenieping(`${p.a} ${opWord(p)} ${p.b} equals ${p.answer}.`);
    }
    setTimeout(nextProblem, 2600);
  }

  function onWrong(p) {
    mission.tries++;
    Sound.wrong();
    replayClass($('#column-sum'), 'shake');
    const want = answerDigits(p);

    if (mission.tries >= 3) {
      mission.locked = true;
      mission.results.push(false);
      mission.digits = mission.digits.map((_, i) => want[i] ?? null);
      renderSlots();
      $('#column-sum').classList.add('revealed');
      showHelper(false);
      const switched = typeof Teenieping !== 'undefined' ? Teenieping.stepQuestion() : false;
      setFeedback('#feedback', `The answer is ${p.answer}. You'll get the next one! 💪`, 'info');
      renderProgress($('#mission-progress'), MISSION_LENGTH, mission.results, mission.idx);
      if (!switched) {
        setTeeniepingSpeech(`The answer is ${p.answer}. You will get the next one!`, true);
      }
      setTimeout(nextProblem, 5000);
      return;
    }

    // Specific feedback on which columns are right.
    const wrong = mission.digits.map((x, i) => (x ?? 0) !== (want[i] ?? 0));
    const okNames = PLACE_NAMES.filter((_, i) => i < wrong.length && !wrong[i]);
    const badNames = PLACE_NAMES.filter((_, i) => wrong[i]);
    let msg = 'Almost! Try again.';
    if (okNames.length) msg = `The ${listWords(okNames)} ${okNames.length > 1 ? 'are' : 'is'} right! Check the ${listWords(badNames)}.`;
    if (mission.tries === 2) {
      msg += " Let's use the helper!";
      if (typeof Teenieping !== 'undefined') {
        setTeeniepingSpeech(Teenieping.hint(), false);
      }
    }
    setFeedback('#feedback', msg, 'try');
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.speakText(msg, { charId: leader ? leader.id : 'heartsping' });
    } else {
      Speech.say(msg);
    }

    mission.digits = mission.digits.map((x, i) => (wrong[i] ? null : x));
    mission.slot = wrong.indexOf(true);
    renderSlots();
    if (mission.tries === 2) showHelper(false);
  }

  function nextProblem() {
    if (currentScreen !== 'mission') return;
    mission.idx++;
    if (mission.idx >= MISSION_LENGTH) finishMission();
    else renderProblem();
  }

  function finishMission() {
    const { planet, earned } = mission;
    const before = unlockedCount(state.stars - earned);
    const after = unlockedCount();
    state.best[planet.id] = Math.max(state.best[planet.id] ?? 0, earned);
    save();
    const newPlanet = after > before ? PLANETS[after - 1] : null;
    showReward({
      emoji: newPlanet ? '🪐' : earned >= 4 ? '🏆' : '🚀',
      title: earned >= 4 ? 'Mission complete!' : 'Good flying!',
      text: `You got ${earned} stars on ${planet.name}.` + (newPlanet ? ` You can fly to ${newPlanet.name} now!` : ''),
      earned,
      total: MISSION_LENGTH,
      onClose: () => { renderMap(); showScreen('map'); },
    });
  }

  // Helper panel: base-ten blocks + step-by-step column method.
  const listWords = (arr) => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);

  // Base-ten blocks: thousands = big cubes, hundreds = flats, tens = rods, ones = little cubes.
  const BLOCK_SHAPES = ['cube', 'rod', 'flat', 'kilo'];
  const SINGULAR = ['one', 'ten', 'hundred', 'thousand'];
  function blocks(n, extraClass = '') {
    const d = MathEngine.digitsOf(n);
    const label = d.map((x, i) => `${x} ${x === 1 ? SINGULAR[i] : PLACE_NAMES[i]}`).reverse().join(', ');
    const pics = d.map((x, i) => `<div class="bk bk-${BLOCK_SHAPES[i]}">${`<i class="${BLOCK_SHAPES[i]}"></i>`.repeat(x)}</div>`).reverse().join('');
    return `<div class="block-group ${extraClass}" aria-label="${label}">
      <div class="block-pics">${pics}</div>
      <div class="block-num">${n}</div><div class="block-cap">${label}</div></div>`;
  }

  function showHelper(speak = true) {
    const p = currentProblem();
    const steps = MathEngine.hintSteps(p);
    const el = $('#helper');
    el.innerHTML = `
      <h3>Let's think! 🧠</h3>
      <div class="blocks">${blocks(p.a)}<span class="blocks-op">${opSign(p)}</span>${blocks(p.b, p.op === 'sub' ? 'take' : '')}</div>
      <ol class="steps">${steps.map((s) => `<li><button class="step">${s}</button></li>`).join('')}</ol>`;
    el.hidden = false;
    if (speak) {
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(MathEngine.speakable(steps.join(' ')), { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(MathEngine.speakable(steps.join(' ')));
      }
    }
  }

  $('#helper').addEventListener('click', (e) => {
    const step = e.target.closest('.step');
    if (step) {
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(MathEngine.speakable(step.textContent), { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(MathEngine.speakable(step.textContent));
      }
    }
  });

  $('#btn-hint').addEventListener('click', () => {
    if ($('#helper').hidden) {
      showHelper();
      if (typeof Teenieping !== 'undefined') {
        const leader = Teenieping.getLeader();
        setTeeniepingSpeech(Teenieping.hint(), true, 'hint');
      }
      $('#helper').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
    } else {
      $('#helper').hidden = true;
      Speech.stop();
      if (typeof TeeniepingAudio !== 'undefined') TeeniepingAudio.stop();
    }
  });

  $('#btn-mission-back').addEventListener('click', () => { renderMap(); showScreen('map'); });

  document.addEventListener('keydown', (e) => {
    if (currentScreen !== 'mission' || dialog.open) return;
    if (/^[0-9]$/.test(e.key)) pressKey(e.key);
    else if (e.key === 'Backspace') pressKey('del');
    else if (e.key === 'Enter' && !e.target.closest('button')) pressKey('ok');
  });

  // ---------- Word Hunt ----------
  const words = { level: null, rounds: [], idx: 0, earned: 0, results: [], firstTry: true, locked: false, canHear: false };

  function renderWordLevels() {
    $('#word-levels').innerHTML = WORD_LEVELS.map((L, i) => `
      <button class="level-card" data-level="${i}" id="level-${L.id}">
        <span class="level-emoji" aria-hidden="true">${L.emoji}</span>
        <span class="level-name">${L.name}</span>
        <span class="level-sample">${L.sight.slice(0, 3).join(' · ')}</span>
      </button>`).join('');
  }

  $('#word-levels').addEventListener('click', (e) => {
    const card = e.target.closest('.level-card');
    if (card) { Sound.tap(); startWords(Number(card.dataset.level)); }
  });

  // Alternate rounds: "listen & find the word" and "read the word & find the picture".
  function startWords(levelIdx) {
    const L = WORD_LEVELS[levelIdx];
    const sight = shuffle(L.sight);
    const pics = shuffle(L.pictures);
    const rounds = [];
    for (let i = 0; i < WORD_ROUNDS; i++) {
      if (i % 2 === 0) {
        const target = sight.pop();
        const others = shuffle(L.sight.filter((w) => w !== target)).slice(0, 3);
        rounds.push({ mode: 'listen', target, choices: shuffle([target, ...others]) });
      } else {
        const target = pics.pop();
        const others = shuffle(L.pictures.filter((p) => p !== target)).slice(0, 3);
        rounds.push({ mode: 'read', target: target[0], emoji: target[1], choices: shuffle([target, ...others]) });
      }
    }
    Object.assign(words, { level: L, rounds, idx: 0, earned: 0, results: [] });
    $('#words-title').textContent = L.name;
    $('#word-levels').hidden = true;
    $('#word-round').hidden = false;
    renderRound();
  }

  function renderRound() {
    const r = words.rounds[words.idx];
    Object.assign(words, { firstTry: true, locked: false, canHear: r.mode === 'listen' });
    renderProgress($('#words-progress'), WORD_ROUNDS, words.results, words.idx);
    setFeedback('#word-feedback', '');
    const target = $('#word-target');
    const choices = $('#word-choices');

    if (r.mode === 'listen') {
      $('#word-prompt-text').textContent = 'Listen. Tap the word you hear!';
      target.innerHTML = '<button class="hear-btn" id="btn-hear" aria-label="Hear the word again">🔊</button>';
      choices.className = 'word-choices words';
      choices.innerHTML = r.choices.map((w) => `<button class="choice" data-value="${w}">${w}</button>`).join('');
      setTimeout(() => {
        const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.speakText(r.target, { charId: leader ? leader.id : 'heartsping', rate: 0.75 });
        } else {
          Speech.say(r.target, { rate: 0.75 });
        }
      }, 350);
    } else {
      $('#word-prompt-text').textContent = 'Read the word. Tap the picture!';
      target.innerHTML = `<button class="big-word" id="btn-big-word">${r.target}</button>`;
      choices.className = 'word-choices pics';
      choices.innerHTML = r.choices.map(([w, e]) => `<button class="choice" data-value="${w}" aria-label="${w}">${e}</button>`).join('');
    }
  }

  $('#word-target').addEventListener('click', (e) => {
    const r = words.rounds[words.idx];
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (e.target.closest('#btn-hear')) {
      replayClass(e.target.closest('#btn-hear'), 'pulse');
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(r.target, { charId: leader ? leader.id : 'heartsping', rate: 0.75 });
      } else {
        Speech.say(r.target, { rate: 0.75 });
      }
    } else if (e.target.closest('#btn-big-word')) {
      if (words.canHear) {
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.speakText(r.target, { charId: leader ? leader.id : 'heartsping', rate: 0.75 });
        } else {
          Speech.say(r.target, { rate: 0.75 });
        }
      } else {
        setFeedback('#word-feedback', 'Try to read it yourself first! 💪', 'info');
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.speakText('Try to read it yourself first!', { charId: leader ? leader.id : 'heartsping' });
        } else {
          Speech.say('Try to read it yourself first!');
        }
      }
    }
  });

  $('#btn-prompt').addEventListener('click', () => {
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    const txt = $('#word-prompt-text').textContent;
    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.speakText(txt, { charId: leader ? leader.id : 'heartsping' });
    } else {
      Speech.say(txt);
    }
  });

  $('#word-choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.choice');
    if (!btn || words.locked || btn.disabled) return;
    const r = words.rounds[words.idx];
    if (btn.dataset.value === r.target) {
      words.locked = true;
      btn.classList.add('right');
      words.results.push(words.firstTry);
      if (words.firstTry) { words.earned++; addStar(); }
      renderProgress($('#words-progress'), WORD_ROUNDS, words.results, words.idx);
      Sound.correct();
      confetti(20);
      const switched = typeof Teenieping !== 'undefined' ? Teenieping.stepQuestion() : false;
      const praise = typeof Teenieping !== 'undefined' ? Teenieping.cheer() : 'Yes!';
      setFeedback('#word-feedback', `${praise} "${r.target}" ${words.firstTry ? '⭐' : ''}`, 'good');
      if (!switched) {
        cheerWithTeenieping(`"${r.target}" is right!`);
      }
      setTimeout(nextRound, 1700);
    } else {
      words.firstTry = false;
      btn.disabled = true;
      btn.classList.add('wrong');
      replayClass(btn, 'shake');
      Sound.wrong();
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (r.mode === 'listen') {
        setFeedback('#word-feedback', 'Not that one. Listen again!', 'try');
        const msg = `That says ${btn.dataset.value}. Listen again: ${r.target}.`;
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.speakText(msg, { charId: leader ? leader.id : 'heartsping', rate: 0.75 });
        } else {
          Speech.say(msg, { rate: 0.75 });
        }
      } else {
        words.canHear = true;
        $('#btn-big-word').classList.add('hearable');
        setFeedback('#word-feedback', 'Not quite! Tap the word to hear it.', 'try');
        const msg = `Not quite. That is a ${btn.dataset.value}. Tap the word to hear it.`;
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.speakText(msg, { charId: leader ? leader.id : 'heartsping' });
        } else {
          Speech.say(msg);
        }
      }
    }
  });

  function nextRound() {
    if (currentScreen !== 'words' || $('#word-round').hidden) return;
    words.idx++;
    if (words.idx < WORD_ROUNDS) return renderRound();
    const { earned, level } = words;
    showReward({
      emoji: earned >= 6 ? '📚' : '🌟',
      title: earned >= 6 ? 'Super reader!' : 'Nice reading!',
      text: `You got ${earned} stars in ${level.name}.`,
      earned,
      total: WORD_ROUNDS,
      onClose: showWordLevels,
    });
  }

  function showWordLevels() {
    $('#words-title').textContent = 'Word Hunt';
    $('#words-progress').innerHTML = '';
    $('#word-round').hidden = true;
    $('#word-levels').hidden = false;
  }

  $('#btn-words-back').addEventListener('click', () => {
    if (typeof TeeniepingAudio !== 'undefined') TeeniepingAudio.stop();
    Speech.stop();
    if (!$('#word-round').hidden) showWordLevels();
    else showScreen('home');
  });

  // ---------- Story Time (Complete Articles & Fill-in-the-blank) ----------
  const articleState = {
    parsed: null,
    filled: {},
    activeBlankIndex: 0,
    locked: false,
  };
  window._articleState = articleState;

  function renderStoryShelf() {
    const shelf = $('#story-shelf');
    if (!shelf) return;
    shelf.innerHTML = StoryGen.STORY_THEMES.map((theme, i) => {
      const reads = Number((state.readArticles && state.readArticles[theme.id]) || 0);
      return `
        <button class="story-card-shelf" data-story-idx="${i}" id="story-${theme.id}">
          ${reads ? `<span class="story-badge-read">⭐ Read ${reads}×</span>` : ''}
          <span class="story-cover-emoji" aria-hidden="true">${theme.emoji}</span>
          <h3 class="story-shelf-title">${theme.name}</h3>
          <p class="story-shelf-level">Grade 1 · new story every time 🎲</p>
        </button>
      `;
    }).join('');
  }

  $('#story-shelf').addEventListener('click', (e) => {
    const card = e.target.closest('.story-card-shelf');
    if (card) {
      Sound.tap();
      startStory(Number(card.dataset.storyIdx));
    }
  });

  function startStory(idx) {
    const art = StoryGen.makeArticle(StoryGen.STORY_THEMES[idx]);
    const parsed = parseArticle(art);
    articleState.parsed = parsed;
    articleState.filled = {};
    articleState.activeBlankIndex = 0;
    articleState.locked = false;

    $('#stories-title').textContent = parsed.title;
    $('#article-heading').textContent = parsed.title;
    $('#article-emoji').textContent = parsed.emoji;
    $('#article-level-tag').textContent = parsed.level;
    $('#screen-stories').style.setProperty('--story-accent', parsed.accent);

    $('#story-shelf').hidden = true;
    $('#story-reader').hidden = false;
    $('#article-complete-actions').hidden = true;

    renderArticleView();
    setTimeout(() => {
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const msg = `${parsed.title}. Read the article and tap words to fill in the blanks!`;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(msg, { charId: leader ? leader.id : 'heartsping', rate: 0.85 });
      } else {
        Speech.say(msg, { rate: 0.85 });
      }
    }, 300);
  }

  function renderArticleView() {
    const { parsed, filled, activeBlankIndex } = articleState;
    const container = $('#article-paragraphs');
    container.innerHTML = '';

    renderProgress(
      $('#story-progress'),
      parsed.blanks.length,
      parsed.blanks.map((_, i) => filled[i] != null),
      activeBlankIndex
    );

    let charOffset = 0;
    parsed.parsedParagraphs.forEach((paraSegments, pIdx) => {
      if (pIdx > 0) charOffset += 2; // For \n\n between paragraphs
      const pEl = document.createElement('p');
      pEl.className = 'article-p';

      paraSegments.forEach((seg) => {
        if (seg.type === 'text') {
          for (const m of seg.text.matchAll(/\S+/g)) {
            const btn = document.createElement('button');
            btn.className = 'word';
            btn.textContent = m[0];
            btn.dataset.start = charOffset + m.index;
            pEl.append(btn, ' ');
          }
          charOffset += seg.text.length;
        } else if (seg.type === 'blank') {
          const bIdx = seg.blankIndex;
          const isFilled = filled[bIdx] != null;
          const isActive = bIdx === activeBlankIndex && !isFilled;
          const word = filled[bIdx] || parsed.blanks[bIdx].correct;

          if (isFilled) {
            const span = document.createElement('span');
            span.className = 'article-blank filled';
            span.textContent = filled[bIdx];
            span.dataset.start = charOffset;
            span.setAttribute('aria-label', `Blank ${bIdx + 1} filled with ${filled[bIdx]}`);
            pEl.append(span, ' ');
          } else {
            const btn = document.createElement('button');
            btn.className = `article-blank ${isActive ? 'active' : 'waiting'}`;
            btn.dataset.blankIdx = bIdx;
            btn.dataset.start = charOffset;
            btn.innerHTML = `${isActive ? '?' : '___'} <span class="blank-num">${bIdx + 1}</span>`;
            btn.setAttribute('aria-label', `Blank ${bIdx + 1} ${isActive ? 'active' : 'waiting'}`);
            pEl.append(btn, ' ');
          }
          charOffset += word.length;
        }
      });

      container.append(pEl);
    });

    renderWordBank();
  }

  function renderWordBank() {
    const { parsed, filled, activeBlankIndex } = articleState;
    const allDone = parsed.blanks.every((_, i) => filled[i] != null);

    if (allDone) {
      $('#bank-tag').textContent = 'Article Complete! 🌟';
      $('#bank-prompt').textContent = 'You filled in every blank! Listen to the full article or collect your stars.';
      $('#bank-choices').innerHTML = '';
      $('#article-complete-actions').hidden = false;
      setFeedback('#article-feedback', 'Awesome reading! 🎉', 'good');
      return;
    }

    const currentBlank = parsed.blanks[activeBlankIndex];
    $('#bank-tag').textContent = `Blank ${activeBlankIndex + 1} of ${parsed.blanks.length}`;
    $('#bank-prompt').textContent = `Choose the word for blank ${activeBlankIndex + 1}:`;
    $('#article-complete-actions').hidden = true;
    setFeedback('#article-feedback', '');

    const choicesEl = $('#bank-choices');
    choicesEl.innerHTML = currentBlank.choices.map((w) => `
      <button class="bank-choice-btn" data-word="${w}">${w}</button>
    `).join('');
  }

  $('#bank-choices').addEventListener('click', (e) => {
    const btn = e.target.closest('.bank-choice-btn');
    if (!btn || articleState.locked || btn.disabled) return;
    const word = btn.dataset.word;
    const { parsed, activeBlankIndex } = articleState;
    const currentBlank = parsed.blanks[activeBlankIndex];

    if (word === currentBlank.correct) {
      articleState.locked = true;
      btn.classList.add('right');
      articleState.filled[activeBlankIndex] = word;
      Sound.correct();
      confetti(24);
      const switched = typeof Teenieping !== 'undefined' ? Teenieping.stepQuestion() : false;
      const praise = typeof Teenieping !== 'undefined' ? Teenieping.cheer() : 'Yes!';
      setFeedback('#article-feedback', `${praise} "${word}" fits perfectly! ⭐`, 'good');
      if (!switched) {
        cheerWithTeenieping(`Yes! "${word}"!`);
      }

      setTimeout(() => {
        articleState.locked = false;
        const nextBlank = parsed.blanks.findIndex((_, i) => articleState.filled[i] == null);
        if (nextBlank !== -1) {
          articleState.activeBlankIndex = nextBlank;
        }
        renderArticleView();
        if (nextBlank === -1) {
          Sound.win();
          confetti(50);
          cheerWithTeenieping('You completed the entire article! Great reading!');
        }
      }, 1100);
    } else {
      btn.disabled = true;
      btn.classList.add('wrong');
      replayClass(btn, 'shake');
      Sound.wrong();
      setFeedback('#article-feedback', `Not quite! Read the sentence to see what fits 📖`, 'try');
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const msg = `That says ${word}. Does ${word} make sense in the sentence? Try another word!`;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(msg, { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(msg);
      }
    }
  });

  $('#article-paragraphs').addEventListener('click', (e) => {
    const blankBtn = e.target.closest('.article-blank:not(.filled)');
    if (blankBtn) {
      Sound.tap();
      articleState.activeBlankIndex = Number(blankBtn.dataset.blankIdx);
      renderArticleView();
      return;
    }

    const wordBtn = e.target.closest('.word');
    if (wordBtn) {
      clearStorySpeaking();
      wordBtn.classList.add('speaking');
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const cleanWord = wordBtn.textContent.replace(/[^\w']/g, '');
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(cleanWord, {
          charId: leader ? leader.id : 'heartsping',
          rate: 0.75,
          onEnd: () => wordBtn.classList.remove('speaking'),
        });
      } else {
        Speech.say(cleanWord, {
          rate: 0.7,
          onEnd: () => wordBtn.classList.remove('speaking'),
        });
      }
    }
  });

  function clearStorySpeaking() {
    $$('#article-paragraphs .word.speaking, #article-paragraphs .article-blank.speaking').forEach((w) => w.classList.remove('speaking'));
  }

  function getFullArticleText(fillAll = false) {
    const { parsed, filled } = articleState;
    return parsed.parsedParagraphs.map((para) => {
      return para.map((seg) => {
        if (seg.type === 'text') return seg.text;
        const word = filled[seg.blankIndex];
        return word || (fillAll ? parsed.blanks[seg.blankIndex].correct : 'blank');
      }).join('');
    }).join('\n\n');
  }

  function readArticleAloud() {
    clearStorySpeaking();
    const text = getFullArticleText(true);
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    const words = $$('#article-paragraphs .word, #article-paragraphs .article-blank.filled');

    const boundaryHandler = (charIndex) => {
      let hit = words[0];
      for (const w of words) {
        if (Number(w.dataset.start) <= charIndex) hit = w;
      }
      clearStorySpeaking();
      hit?.classList.add('speaking');
    };

    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.speakText(text, {
        charId: leader ? leader.id : 'heartsping',
        rate: 0.82,
        onBoundary: boundaryHandler,
        onEnd: clearStorySpeaking,
      });
    } else {
      Speech.say(text, {
        pitch: leader ? leader.pitch : 1.25,
        rate: leader ? leader.rate : 0.82,
        onBoundary: boundaryHandler,
        onEnd: clearStorySpeaking,
      });
    }
  }

  $('#btn-story-read').addEventListener('click', () => {
    readArticleAloud();
  });

  $('#btn-read-completed').addEventListener('click', () => {
    readArticleAloud();
  });

  $('#btn-finish-article').addEventListener('click', () => {
    finishArticle();
  });

  function finishArticle() {
    const { parsed } = articleState;
    if (!state.readArticles) state.readArticles = {};
    state.readArticles[parsed.id] = Number(state.readArticles[parsed.id] || 0) + 1;
    addStar();
    addStar();
    save();

    showReward({
      emoji: '📚',
      title: 'Story Complete!',
      text: `You read "${parsed.title}"! You earned 2 stars! ⭐⭐`,
      earned: 2,
      total: 2,
      onClose: showStoryShelf,
    });
  }

  function showStoryShelf() {
    $('#stories-title').textContent = 'Story Time';
    $('#story-progress').innerHTML = '';
    $('#story-reader').hidden = true;
    $('#story-shelf').hidden = false;
    renderStoryShelf();
  }

  $('#btn-stories-back').addEventListener('click', () => {
    if (typeof TeeniepingAudio !== 'undefined') TeeniepingAudio.stop();
    Speech.stop();
    if (!$('#story-reader').hidden) showStoryShelf();
    else showScreen('home');
  });

  // ---------- Home ----------
  $('#btn-math').addEventListener('click', () => {
    Sound.tap();
    renderMap();
    showScreen('map');
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => TeeniepingAudio.speakText('Math Missions! Pick a planet.', { charId: leader ? leader.id : 'heartsping' }), 300);
    } else {
      setTimeout(() => Speech.say('Math Missions! Pick a planet.'), 300);
    }
  });

  $('#btn-words').addEventListener('click', () => {
    Sound.tap();
    showWordLevels();
    showScreen('words');
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => TeeniepingAudio.speakText('Word Hunt! Pick your words.', { charId: leader ? leader.id : 'heartsping' }), 300);
    } else {
      setTimeout(() => Speech.say('Word Hunt! Pick your words.'), 300);
    }
  });

  $('#btn-stories').addEventListener('click', () => {
    Sound.tap();
    showStoryShelf();
    showScreen('stories');
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => TeeniepingAudio.speakText('Story Time! Pick a story to read.', { charId: leader ? leader.id : 'heartsping' }), 300);
    } else {
      setTimeout(() => Speech.say('Story Time! Pick a story to read.'), 300);
    }
  });

  const btnRace = $('#btn-race');
  if (btnRace) {
    btnRace.addEventListener('click', () => {
      Sound.tap();
      showScreen('race');
      startRaceMode('mix');
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        setTimeout(() => TeeniepingAudio.speakText('Turbo Racing! Answer fast to win the race!', { charId: leader ? leader.id : 'heartsping' }), 300);
      } else {
        setTimeout(() => Speech.say('Turbo Racing! Answer fast to win the race!'), 300);
      }
    });
  }

  const btnTetris = $('#btn-tetris');
  if (btnTetris) {
    btnTetris.addEventListener('click', () => {
      Sound.tap();
      showScreen('tetris');
      startTetrisMode('mix');
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        setTimeout(() => TeeniepingAudio.speakText('Magic Blocks! Answer questions to drop candy gems and clear lines!', { charId: leader ? leader.id : 'heartsping' }), 300);
      } else {
        setTimeout(() => Speech.say('Magic Blocks! Answer questions to drop candy gems and clear lines!'), 300);
      }
    });
  }

  const btnCityHero = $('#btn-city-hero');
  if (btnCityHero) {
    btnCityHero.addEventListener('click', () => {
      Sound.tap();
      showScreen('city-hub');
      renderCityHub();
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        setTimeout(() => TeeniepingAudio.speakText('City Hero! Pick a world city to explore and help citizens, chuping!', { charId: leader ? leader.id : 'heartsping' }), 300);
      } else {
        setTimeout(() => Speech.say('City Hero! Pick a world city to explore and help citizens!'), 300);
      }
    });
  }

  const btnBakery = $('#btn-bakery');
  if (btnBakery) {
    btnBakery.addEventListener('click', () => {
      Sound.tap();
      showScreen('bakery');
      startBakeryMode();
    });
  }

  const btnPlatformer = $('#btn-platformer');
  if (btnPlatformer) {
    btnPlatformer.addEventListener('click', () => {
      Sound.tap();
      showScreen('platformer');
      startPlatformerMode();
    });
  }

  $$('.js-home').forEach((b) => b.addEventListener('click', () => showScreen('home')));

  function applyVoice() {
    Speech.enabled = Sound.enabled = state.voice;
    if (typeof TeeniepingAudio !== 'undefined') {
      TeeniepingAudio.engine.enabled = state.voice;
      if (!state.voice) TeeniepingAudio.stop();
    }
    const btn = $('#btn-sound');
    btn.textContent = state.voice ? '🔊 Voice on' : '🔇 Voice off';
    btn.setAttribute('aria-pressed', String(state.voice));
  }

  $('#btn-sound').addEventListener('click', () => {
    state.voice = !state.voice;
    save();
    applyVoice();
    if (!state.voice) {
      Speech.stop();
      if (typeof TeeniepingAudio !== 'undefined') TeeniepingAudio.stop();
    }
  });

  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('Start over? This clears all stars and planets.')) return;
    Object.assign(state, { ...DEFAULTS, best: {}, voice: state.voice });
    save();
    refreshStars();
  });

  // ---------- Teenieping Turbo Racing Controller ----------
  let raceState = {
    category: 'mix',
    racers: [],
    question: null,
    questionStartTime: 0,
    animFrame: null,
    lastTime: 0,
    elapsed: 0,
    isOver: false,
    nitroInterval: null,
    countdownTimers: [],
  };

  function stopRaceMode() {
    raceState.isOver = true;
    if (raceState.animFrame) {
      cancelAnimationFrame(raceState.animFrame);
      raceState.animFrame = null;
    }
    if (raceState.nitroInterval) {
      clearInterval(raceState.nitroInterval);
      raceState.nitroInterval = null;
    }
    if (raceState.countdownTimers.length) {
      raceState.countdownTimers.forEach((t) => clearTimeout(t));
      raceState.countdownTimers = [];
    }
  }

  function runRaceCountdown() {
    const gantry = $('#race-start-gantry');
    const l1 = $('#race-light-1');
    const l2 = $('#race-light-2');
    const l3 = $('#race-light-3');
    const txt = $('#race-gantry-text');
    if (!gantry) return;

    gantry.hidden = false;
    [l1, l2, l3].forEach((l) => { if (l) l.className = 'gantry-bulb'; });
    if (l1) l1.classList.add('red');
    if (txt) txt.textContent = '3 • REV UP!';
    Sound.countdownBeep?.();

    const t1 = setTimeout(() => {
      if (raceState.isOver) return;
      if (l2) l2.classList.add('amber');
      if (txt) txt.textContent = '2 • SET!';
      Sound.countdownBeep?.();
    }, 320);

    const t2 = setTimeout(() => {
      if (raceState.isOver) return;
      [l1, l2, l3].forEach((l) => { if (l) l.className = 'gantry-bulb green'; });
      if (txt) txt.textContent = '🟢 GO! GO! GO!';
      Sound.countdownGo?.();
    }, 640);

    const t3 = setTimeout(() => {
      if (gantry) gantry.hidden = true;
    }, 1350);

    raceState.countdownTimers.push(t1, t2, t3);
  }

  function startRaceMode(category) {
    if (category) raceState.category = category;
    stopRaceMode();

    if (typeof RaceEngine === 'undefined') return;

    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    const roster = typeof Teenieping !== 'undefined' ? (Teenieping.TEENIEPINGS || Teenieping.ROSTER || []) : [];
    raceState.racers = RaceEngine.createRacers(leader, roster);
    raceState.isOver = false;
    raceState.elapsed = 0;
    raceState.lastTime = performance.now();

    renderRaceLanes();
    updateCategoryButtons();
    showNextRaceQuestion();
    Sound.engineRev?.();
    runRaceCountdown();

    const loop = (now) => {
      if (raceState.isOver) return;
      const dt = Math.min(0.1, (now - raceState.lastTime) / 1000);
      raceState.lastTime = now;
      raceState.elapsed += dt;

      const update = RaceEngine.updateRace(raceState.racers, dt, raceState.elapsed);
      updateRaceVisuals(update);

      if (update.raceFinished) {
        finishRace(update.playerRank);
        return;
      }

      raceState.animFrame = requestAnimationFrame(loop);
    };

    raceState.animFrame = requestAnimationFrame(loop);
  }

  function renderRaceLanes() {
    const lanesEl = $('#race-lanes');
    if (!lanesEl) return;
    lanesEl.innerHTML = raceState.racers.map((r, idx) => {
      const isPlayer = r.isPlayer;
      const char = typeof Teenieping !== 'undefined'
        ? (typeof Teenieping.get === 'function' ? Teenieping.get(r.charId) : (Teenieping.TEENIEPINGS || []).find((c) => c.id === r.charId))
        : null;
      const avatarSvg = char ? char.avatarSvg : `<span>${r.symbol}</span>`;
      const carNum = isPlayer ? '1' : String(idx + 1);
      return `<div class="race-lane" id="race-lane-${r.id}" style="--kart-color:${r.accent}">
        <span class="lane-number-watermark">LANE ${idx + 1}</span>
        <div class="race-kart ${isPlayer ? 'player' : ''}" id="kart-${r.id}" style="left:4%;">
          <div class="kart-spoiler"></div>
          <div class="kart-exhaust">🔥</div>
          <div class="kart-smoke" aria-hidden="true">💨</div>
          <div class="kart-body">
            <span class="kart-num-decal">${carNum}</span>
            <div class="kart-driver">${avatarSvg}</div>
            <div class="kart-windshield"></div>
            <div class="kart-nose"></div>
            <div class="kart-wheels"><div class="wheel"></div><div class="wheel"></div></div>
          </div>
          <span class="kart-tag">${isPlayer ? '⭐ YOU' : r.name}</span>
        </div>
      </div>`;
    }).join('');

    // Update mini-map icons
    raceState.racers.forEach((r, i) => {
      const progEl = i === 0 ? $('#race-prog-player') : $(`#race-prog-rival${i - 1}`);
      if (progEl) {
        progEl.textContent = r.symbol;
        progEl.style.left = '0%';
      }
    });
  }

  function updateCategoryButtons() {
    $$('#screen-race .race-cat-btn:not(.tetris-cat-btn)').forEach((b) => {
      b.classList.toggle('active', b.dataset.cat === raceState.category);
    });
  }

  function updateRaceVisuals(update) {
    const player = raceState.racers.find((r) => r.isPlayer);
    if (!player) return;

    const rankSuffix = ['1st 🥇', '2nd 🥈', '3rd 🥉', '4th 🏁'];
    const rankBadge = $('#race-rank-badge');
    if (rankBadge) {
      rankBadge.textContent = rankSuffix[Math.min(3, Math.max(0, update.playerRank - 1))];
    }

    const tel = update.telemetry || (typeof RaceEngine.computeTelemetry === 'function' ? RaceEngine.computeTelemetry(player, raceState.racers) : null);
    const speedo = $('#race-speed-display');
    if (speedo) {
      speedo.textContent = tel ? tel.speedKmH : Math.round(player.speed * 3.6);
    }

    const gearEl = $('#race-gear-display');
    if (gearEl && tel) gearEl.textContent = `G${tel.gear}`;

    const rpmValEl = $('#race-rpm-val');
    if (rpmValEl && tel) rpmValEl.textContent = tel.rpm;

    const rpmFillEl = $('#race-rpm-fill');
    if (rpmFillEl && tel) rpmFillEl.style.width = `${tel.rpmPct}%`;

    const odomEl = $('#race-odom-display');
    if (odomEl) odomEl.textContent = `${Math.round(player.distance)}m`;

    const gapEl = $('#race-gap-display');
    if (gapEl && tel) {
      gapEl.textContent = tel.drafting ? '💨 SLIPSTREAM!' : tel.gapText;
      gapEl.classList.toggle('drafting-active', !!tel.drafting);
    }

    const trackLen = RaceEngine.TRACK_LENGTH;
    const sceneryEl = $('#race-scenery-strip');
    if (sceneryEl) {
      const visDist = typeof player.visualDistance === 'number' ? player.visualDistance : player.distance;
      sceneryEl.style.backgroundPositionX = `${-Math.round(visDist * 1.5)}px`;
    }

    raceState.racers.forEach((r, i) => {
      const visDist = typeof r.visualDistance === 'number' ? r.visualDistance : r.distance;
      const pct = Math.min(100, Math.max(0, (visDist / trackLen) * 100));
      const progEl = i === 0 ? $('#race-prog-player') : $(`#race-prog-rival${i - 1}`);
      if (progEl) progEl.style.left = `${pct}%`;

      const kartEl = $(`#kart-${r.id}`);
      if (kartEl) {
        const lanePct = 4 + (pct * 0.84);
        kartEl.style.left = `${lanePct}%`;
        const wheelDur = Math.max(0.08, Math.min(0.45, 5.5 / Math.max(8, r.speed))).toFixed(2);
        kartEl.style.setProperty('--wheel-dur', `${wheelDur}s`);
        if (r.boostTime > 0 && r.boostTier !== 'miss') {
          kartEl.classList.add('boosting');
          kartEl.classList.toggle('super-boosting', r.boostTier === 'super');
          $(`#race-lane-${r.id}`)?.classList.add('boosting');
        } else {
          kartEl.classList.remove('boosting', 'super-boosting');
          $(`#race-lane-${r.id}`)?.classList.remove('boosting');
        }
      }
    });
  }

  function showNextRaceQuestion() {
    if (raceState.isOver || typeof RaceEngine === 'undefined') return;
    const q = RaceEngine.makeQuestion(
      raceState.category,
      typeof MathEngine !== 'undefined' ? MathEngine : null,
      typeof WORD_LEVELS !== 'undefined' ? WORD_LEVELS : null
    );
    raceState.question = q;
    raceState.questionStartTime = Date.now();

    const badge = $('#race-q-badge');
    const prompt = $('#race-q-prompt');
    const choicesEl = $('#race-choices');
    const banner = $('#race-boost-banner');
    if (banner) banner.hidden = true;

    if (badge) badge.textContent = q.category === 'math' ? '🔢 Math Sprint' : '📖 Reading Sprint';
    if (prompt) prompt.textContent = q.prompt;

    if (choicesEl) {
      choicesEl.innerHTML = q.choices.map((c, i) =>
        `<button class="race-choice-btn" data-idx="${i}">${c.text}</button>`
      ).join('');

      $$('#race-choices .race-choice-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => handleRaceChoice(q.choices[idx], btn));
      });
    }

    // Nitro gauge countdown (6 seconds bonus window)
    if (raceState.nitroInterval) clearInterval(raceState.nitroInterval);
    const nitroFill = $('#nitro-bar-fill');
    if (nitroFill) {
      nitroFill.style.width = '100%';
      const start = Date.now();
      raceState.nitroInterval = setInterval(() => {
        const elapsedSec = (Date.now() - start) / 1000;
        const pct = Math.max(0, 100 - (elapsedSec / 6.0) * 100);
        nitroFill.style.width = `${pct}%`;
        if (pct <= 0) {
          clearInterval(raceState.nitroInterval);
          raceState.nitroInterval = null;
        }
      }, 50);
    }
  }

  function handleRaceChoice(choice, btn) {
    if (raceState.isOver || !raceState.question || typeof RaceEngine === 'undefined') return;
    const isCorrect = choice.isCorrect;
    const duration = (Date.now() - raceState.questionStartTime) / 1000;
    const player = raceState.racers.find((r) => r.isPlayer);
    const result = RaceEngine.applyAnswerResult(player, isCorrect, duration);

    $$('#race-choices .race-choice-btn').forEach((b) => { b.disabled = true; });

    const banner = $('#race-boost-banner');
    if (banner && result) {
      banner.hidden = false;
      banner.className = `race-boost-banner ${result.type}`;
      banner.textContent = result.label;
    }

    const playerKartEl = $('#kart-player');

    if (isCorrect) {
      btn.classList.add('correct');
      Sound.turbo?.();
      Sound.correct?.();
      if (duration < 3.2) {
        confetti(30);
        const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.playCheerWithSpeech(
            leader ? leader.id : 'heartsping',
            'Super Turbo boost! Zoom!',
            { pitch: leader?.pitch, rate: leader?.rate }
          );
        }
      }
    } else {
      btn.classList.add('wrong');
      Sound.brakeScreech?.();
      Sound.wrong?.();
      if (playerKartEl) {
        playerKartEl.classList.add('slipping');
        setTimeout(() => playerKartEl.classList.remove('slipping'), 800);
      }
    }

    setTimeout(() => {
      if (!raceState.isOver) showNextRaceQuestion();
    }, 650);
  }

  function finishRace(playerRank) {
    stopRaceMode();

    const starsAwarded = playerRank === 1 ? 3 : playerRank === 2 ? 2 : 1;
    for (let i = 0; i < starsAwarded; i++) addStar();

    const titles = {
      1: '🏆 1st Place! Turbo Champion!',
      2: '🥈 2nd Place! Silver Podium!',
      3: '🥉 3rd Place! Bronze Trophy!',
      4: '🏁 Finished the Race!',
    };
    const messages = {
      1: 'Incredible driving! You won the Teenieping Grand Prix and earned 3 Stars! ⭐⭐⭐',
      2: 'Lightning fast! You placed 2nd and earned 2 Stars! ⭐⭐',
      3: 'Great race! You placed 3rd and earned 1 Star! ⭐',
      4: 'You crossed the finish line! Keep answering quickly to take the lead! ⭐',
    };

    setTimeout(() => {
      showReward({
        emoji: playerRank === 1 ? '🏆' : playerRank === 2 ? '🥈' : '🥉',
        title: titles[playerRank] || 'Race Complete!',
        text: messages[playerRank] || 'Great racing!',
        earned: starsAwarded,
        total: 3,
        onClose: () => {
          showScreen('home');
        },
      });
    }, 600);
  }

  // Hook up race category and audio buttons (scoped to #screen-race)
  $$('#screen-race .race-cat-btn:not(.tetris-cat-btn)').forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.tap();
      const cat = btn.dataset.cat;
      startRaceMode(cat);
    });
  });

  const btnRaceRead = $('#btn-race-read');
  if (btnRaceRead) {
    btnRaceRead.addEventListener('click', () => {
      if (!raceState.question) return;
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const text = raceState.question.speechText || raceState.question.prompt;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(text, { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(text, { pitch: leader ? leader.pitch : 1.25, rate: leader ? leader.rate : 0.88 });
      }
    });
  }

  // ---------- Teenieping Magic Blocks (Tetris) Controller ----------
  let tetrisState = {
    category: 'mix',
    grid: [],
    currentPiece: null,
    nextPiece: null,
    activePiece: null,
    score: 0,
    linesCleared: 0,
    level: 1,
    streak: 0,
    isOver: false,
    isAnimatingDrop: false,
    gravityInterval: null,
    question: null,
    questionStartTime: 0,
  };

  function stopTetrisMode() {
    tetrisState.isOver = true;
    tetrisState.isAnimatingDrop = false;
    if (tetrisState.gravityInterval) {
      clearInterval(tetrisState.gravityInterval);
      tetrisState.gravityInterval = null;
    }
  }

  function spawnNextTetrisActivePiece() {
    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    if (!tetrisState.nextPiece) {
      tetrisState.nextPiece = TetrisEngine.pickRandomPiece(leader ? leader.id : null);
    }
    tetrisState.currentPiece = tetrisState.nextPiece;
    tetrisState.nextPiece = TetrisEngine.pickRandomPiece(leader ? leader.id : null);
    if (typeof TetrisEngine.createActivePiece === 'function') {
      tetrisState.activePiece = TetrisEngine.createActivePiece(tetrisState.currentPiece);
    } else {
      tetrisState.activePiece = null;
    }
  }

  function startTetrisGravity() {
    if (tetrisState.gravityInterval) clearInterval(tetrisState.gravityInterval);
    const tickMs = Math.max(950, 2100 - (tetrisState.level - 1) * 220);
    tetrisState.gravityInterval = setInterval(() => {
      if (tetrisState.isOver || tetrisState.isAnimatingDrop || currentScreen !== 'tetris') return;
      if (!tetrisState.activePiece || typeof TetrisEngine.moveActivePiece !== 'function') return;

      const step = TetrisEngine.moveActivePiece(tetrisState.grid, tetrisState.activePiece, 1, 0);
      if (step.moved) {
        tetrisState.activePiece = step.active;
        renderTetrisBoard();
      } else {
        // Reached surface naturally via gravity: wrap back to top so child has time to answer or steer
        tetrisState.activePiece = TetrisEngine.createActivePiece(tetrisState.currentPiece);
        renderTetrisBoard();
      }
    }, tickMs);
  }

  function startTetrisMode(category) {
    if (category) tetrisState.category = category;
    stopTetrisMode();

    if (typeof TetrisEngine === 'undefined') return;

    tetrisState.isOver = false;
    tetrisState.isAnimatingDrop = false;
    tetrisState.grid = TetrisEngine.createEmptyGrid();
    tetrisState.nextPiece = null;
    spawnNextTetrisActivePiece();
    tetrisState.score = 0;
    tetrisState.linesCleared = 0;
    tetrisState.level = 1;
    tetrisState.streak = 0;

    const callout = $('#tetris-callout');
    if (callout) callout.hidden = true;

    renderTetrisBoard();
    renderNextPiecePreview();
    updateTetrisHUD();
    updateTetrisCategoryButtons();
    showNextTetrisQuestion();
    startTetrisGravity();
  }

  function updateTetrisCategoryButtons() {
    $$('.tetris-cat-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.cat === tetrisState.category);
    });
  }

  function updateTetrisHUD() {
    tetrisState.level = 1 + Math.floor(tetrisState.linesCleared / 3);
    const linesEl = $('#tetris-lines-badge');
    if (linesEl) {
      linesEl.innerHTML = `Lines: <b>${tetrisState.linesCleared}</b>/10 🎯`;
    }
    const scoreEl = $('#tetris-score-val');
    if (scoreEl) scoreEl.textContent = tetrisState.score;
    const levelEl = $('#tetris-level-val');
    if (levelEl) levelEl.textContent = tetrisState.level;
    const streakEl = $('#tetris-streak-val');
    if (streakEl) streakEl.textContent = `🔥 ${tetrisState.streak}`;
  }

  function showTetrisCallout(text) {
    const callout = $('#tetris-callout');
    if (!callout) return;
    callout.textContent = text;
    callout.hidden = false;
    replayClass(callout, 'pop');
    setTimeout(() => {
      if (callout.textContent === text) callout.hidden = true;
    }, 1500);
  }

  function renderTetrisBoard(highlightCells = [], clearingRows = [], trailCells = []) {
    const gridEl = $('#tetris-grid');
    if (!gridEl || !tetrisState.grid || tetrisState.grid.length === 0) return;

    const activeCells =
      !tetrisState.isAnimatingDrop && tetrisState.activePiece && typeof TetrisEngine.getActiveCells === 'function'
        ? TetrisEngine.getActiveCells(tetrisState.activePiece)
        : [];
    const ghostInfo =
      !tetrisState.isAnimatingDrop && tetrisState.activePiece && typeof TetrisEngine.getGhostCells === 'function'
        ? TetrisEngine.getGhostCells(tetrisState.grid, tetrisState.activePiece)
        : { cells: [] };
    const ghostCells = ghostInfo.cells || [];
    const activePieceObj = tetrisState.activePiece?.piece || tetrisState.currentPiece;

    const html = [];
    const rows = tetrisState.grid.length;
    const cols = tetrisState.grid[0].length;

    for (let r = 0; r < rows; r++) {
      const isClearingRow = clearingRows.includes(r);
      for (let c = 0; c < cols; c++) {
        const cell = tetrisState.grid[r][c];
        const isHighlight = highlightCells.some(([hr, hc]) => hr === r && hc === c);
        const isTrail = trailCells.some(([tr, tc]) => tr === r && tc === c);
        const isActive = activeCells.some(([ar, ac]) => ar === r && ac === c);
        const isGhost = !isActive && ghostCells.some(([gr, gc]) => gr === r && gc === c);

        let classes = 'tetris-cell';
        let style = '';
        let content = '';

        if (cell) {
          classes += ' filled';
          style = `--cell-glow:${cell.glow || 'rgba(255,255,255,0.4)'}; background-color:${cell.color};`;
          content = `<span class="gem-facet">${cell.symbol || '💎'}</span>`;
        } else if (isActive && activePieceObj) {
          classes += ' filled active-piece';
          style = `--cell-glow:${activePieceObj.glow || 'rgba(255,255,255,0.5)'}; background-color:${activePieceObj.color};`;
          content = `<span class="gem-facet">${activePieceObj.symbol || '💎'}</span>`;
        } else if (isGhost && activePieceObj) {
          classes += ' ghost';
          style = `--ghost-color:${activePieceObj.color};`;
        } else if (isTrail && activePieceObj) {
          classes += ' drop-trail';
          style = `--trail-color:${activePieceObj.color};`;
        }

        if (isHighlight) classes += ' dropped';
        if (isClearingRow) classes += ' clearing';

        html.push(`<div class="${classes}" style="${style}" data-r="${r}" data-c="${c}">${content}</div>`);
      }
    }
    gridEl.innerHTML = html.join('');
  }

  function renderNextPiecePreview() {
    const prevBox = $('#tetris-next-preview');
    const fairyLbl = $('#tetris-next-fairy');
    const p = tetrisState.nextPiece || tetrisState.currentPiece;
    if (!prevBox || !p) return;

    if (fairyLbl) fairyLbl.textContent = `${p.fairyName} ${p.symbol}`;

    const shape = p.shapes[0];
    const sRows = shape.length;
    const sCols = shape[0].length;

    prevBox.innerHTML = `<div class="preview-grid" style="grid-template-columns: repeat(${sCols}, 1fr); grid-template-rows: repeat(${sRows}, 1fr);">
      ${shape.flatMap((row) =>
        row.map((val) =>
          val
            ? `<div class="preview-cell filled-preview" style="background:${p.color}; box-shadow:0 0 6px ${p.glow};"></div>`
            : `<div class="preview-cell" style="background:transparent; border-color:transparent;"></div>`
        )
      ).join('')}
    </div>`;
  }

  function steerTetrisPiece(action) {
    if (tetrisState.isOver || tetrisState.isAnimatingDrop || !tetrisState.activePiece) return;
    if (action === 'left') {
      const res = TetrisEngine.moveActivePiece(tetrisState.grid, tetrisState.activePiece, 0, -1);
      if (res.moved) {
        tetrisState.activePiece = res.active;
        Sound.blockMove?.();
        renderTetrisBoard();
      }
    } else if (action === 'right') {
      const res = TetrisEngine.moveActivePiece(tetrisState.grid, tetrisState.activePiece, 0, 1);
      if (res.moved) {
        tetrisState.activePiece = res.active;
        Sound.blockMove?.();
        renderTetrisBoard();
      }
    } else if (action === 'down') {
      const res = TetrisEngine.moveActivePiece(tetrisState.grid, tetrisState.activePiece, 1, 0);
      if (res.moved) {
        tetrisState.activePiece = res.active;
        Sound.blockMove?.();
        renderTetrisBoard();
      }
    } else if (action === 'rotate') {
      const res = TetrisEngine.rotateActivePiece(tetrisState.grid, tetrisState.activePiece);
      if (res.rotated) {
        tetrisState.activePiece = res.active;
        Sound.blockRotate?.();
        renderTetrisBoard();
      }
    }
  }

  $('#btn-tetris-left')?.addEventListener('click', () => steerTetrisPiece('left'));
  $('#btn-tetris-right')?.addEventListener('click', () => steerTetrisPiece('right'));
  $('#btn-tetris-down')?.addEventListener('click', () => steerTetrisPiece('down'));
  $('#btn-tetris-rotate')?.addEventListener('click', () => steerTetrisPiece('rotate'));

  document.addEventListener('keydown', (e) => {
    if (currentScreen !== 'tetris' || dialog.open || tetrisState.isOver) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); steerTetrisPiece('left'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); steerTetrisPiece('right'); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); steerTetrisPiece('down'); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); steerTetrisPiece('rotate'); }
  });

  function showNextTetrisQuestion() {
    if (tetrisState.isOver || typeof TetrisEngine === 'undefined') return;

    let q;
    if (typeof RaceEngine !== 'undefined' && typeof RaceEngine.makeQuestion === 'function') {
      q = RaceEngine.makeQuestion(
        tetrisState.category,
        typeof MathEngine !== 'undefined' ? MathEngine : null,
        typeof WORD_LEVELS !== 'undefined' ? WORD_LEVELS : null
      );
    } else {
      q = {
        category: 'math',
        prompt: '1 + 1 = ?',
        choices: [{ text: '2', isCorrect: true }, { text: '3', isCorrect: false }],
      };
    }

    tetrisState.question = q;
    tetrisState.questionStartTime = Date.now();

    const badge = $('#tetris-q-badge');
    const prompt = $('#tetris-q-prompt');
    const choicesEl = $('#tetris-choices');
    const banner = $('#tetris-spell-banner');
    if (banner) banner.hidden = true;

    if (badge) badge.textContent = q.category === 'math' ? '🔢 Math Spell' : '📖 Word Spell';
    if (prompt) prompt.textContent = q.prompt;

    if (choicesEl) {
      choicesEl.innerHTML = q.choices.map((c, i) =>
        `<button class="race-choice-btn" data-idx="${i}">${c.text}</button>`
      ).join('');

      $$('#tetris-choices .race-choice-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => handleTetrisChoice(q.choices[idx], btn));
      });
    }

    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    const text = q.speechText || q.prompt;
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => {
        if (!tetrisState.isOver && tetrisState.question === q) {
          TeeniepingAudio.speakText(text, { charId: leader ? leader.id : 'heartsping' });
        }
      }, 350);
    } else {
      setTimeout(() => {
        if (!tetrisState.isOver && tetrisState.question === q) {
          Speech.say(text, { pitch: leader ? leader.pitch : 1.25, rate: leader ? leader.rate : 0.88 });
        }
      }, 350);
    }
  }

  function handleTetrisChoice(choice, btn) {
    if (tetrisState.isOver || !tetrisState.question || typeof TetrisEngine === 'undefined') return;

    const isCorrect = choice.isCorrect;
    const piece = tetrisState.currentPiece;
    const banner = $('#tetris-spell-banner');
    const cheerLbl = $('#tetris-fairy-cheer');

    $$('#tetris-choices .race-choice-btn').forEach((b) => { b.disabled = true; });
    tetrisState.isAnimatingDrop = true;

    if (isCorrect) {
      btn.classList.add('correct');
      Sound.blockDrop?.();
      Sound.correct?.();
      tetrisState.streak++;

      // Magic Smart Auto-Placement
      const bestMove = TetrisEngine.findBestPlacement(tetrisState.grid, piece);
      if (bestMove) {
        const startRow = tetrisState.activePiece ? tetrisState.activePiece.row : 0;
        const trailCells = typeof TetrisEngine.getDropTrailCells === 'function'
          ? TetrisEngine.getDropTrailCells(bestMove.shapeMatrix, startRow, bestMove.row, bestMove.col)
          : [];

        tetrisState.grid = TetrisEngine.placePiece(
          tetrisState.grid,
          bestMove.shapeMatrix,
          bestMove.row,
          bestMove.col,
          piece
        );

        const highlightCells = [];
        for (let r = 0; r < bestMove.shapeMatrix.length; r++) {
          for (let c = 0; c < bestMove.shapeMatrix[0].length; c++) {
            if (bestMove.shapeMatrix[r][c]) {
              highlightCells.push([bestMove.row + r, bestMove.col + c]);
            }
          }
        }
        renderTetrisBoard(highlightCells, [], trailCells);

        if (banner) {
          banner.hidden = false;
          banner.className = 'race-boost-banner normal';
          banner.textContent = `✨ Perfect Magic Fit! ${piece.symbol}`;
        }
        if (cheerLbl) cheerLbl.textContent = `✨ ${piece.fairyName} locked a crystal gem!`;

        const clearResult = TetrisEngine.clearCompletedLines(tetrisState.grid);
        if (clearResult.linesCleared > 0) {
          const calloutNames = ['', '✨ SINGLE +100!', '🔥 DOUBLE +300!', '⚡ TRIPLE +600!', '💎 MAGIC TETRIS +1200!'];
          showTetrisCallout(calloutNames[clearResult.linesCleared] || `🌟 ${clearResult.linesCleared} LINES!`);

          setTimeout(() => {
            renderTetrisBoard([], clearResult.clearedIndices);
            Sound.fanfare?.();
            confetti(30);

            tetrisState.grid = clearResult.grid;
            tetrisState.linesCleared += clearResult.linesCleared;
            tetrisState.score += TetrisEngine.calculateScore(clearResult.linesCleared);
            updateTetrisHUD();

            const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
            if (typeof TeeniepingAudio !== 'undefined') {
              TeeniepingAudio.playCheerWithSpeech(
                leader ? leader.id : 'heartsping',
                `${clearResult.linesCleared} row${clearResult.linesCleared > 1 ? 's' : ''} cleared! Super magic!`,
                { pitch: leader?.pitch, rate: leader?.rate }
              );
            }

            if (banner) {
              banner.className = 'race-boost-banner super';
              banner.textContent = `🎉 Cleared ${clearResult.linesCleared} line${clearResult.linesCleared > 1 ? 's' : ''}! +${TetrisEngine.calculateScore(clearResult.linesCleared)} pts`;
            }

            if (tetrisState.linesCleared >= TetrisEngine.TARGET_LINES_FOR_VICTORY) {
              setTimeout(() => finishTetris(true), 600);
              return;
            }

            setTimeout(() => {
              tetrisState.isAnimatingDrop = false;
              renderTetrisBoard();
            }, 280);
          }, 320);
        } else {
          setTimeout(() => {
            tetrisState.isAnimatingDrop = false;
            renderTetrisBoard();
          }, 260);
        }
      } else {
        tetrisState.isAnimatingDrop = false;
      }
    } else {
      btn.classList.add('wrong');
      Sound.wrong?.();
      Sound.blockDrop?.();
      tetrisState.streak = 0;

      const clumsyMove = TetrisEngine.findSuboptimalPlacement(tetrisState.grid, piece);
      if (clumsyMove) {
        tetrisState.grid = TetrisEngine.placePiece(
          tetrisState.grid,
          clumsyMove.shapeMatrix,
          clumsyMove.row,
          clumsyMove.col,
          piece
        );
        renderTetrisBoard();
      }

      if (banner) {
        banner.hidden = false;
        banner.className = 'race-boost-banner miss';
        banner.textContent = `⚠️ Clumsy drop! Solve the next one!`;
      }
      if (cheerLbl) cheerLbl.textContent = 'Keep trying! We can clear the board together! 💪';

      if (TetrisEngine.isTopOut(tetrisState.grid)) {
        setTimeout(() => {
          tetrisState.grid = TetrisEngine.rescueClear(tetrisState.grid);
          tetrisState.isAnimatingDrop = false;
          renderTetrisBoard();
          confetti(15);
          if (banner) {
            banner.className = 'race-boost-banner normal';
            banner.textContent = '🧚 Teenieping Magic Rescue! Top cleared! ✨';
          }
        }, 400);
      } else {
        setTimeout(() => {
          tetrisState.isAnimatingDrop = false;
          renderTetrisBoard();
        }, 250);
      }
    }

    if (typeof Teenieping !== 'undefined' && typeof Teenieping.stepQuestion === 'function') {
      Teenieping.stepQuestion();
    }

    spawnNextTetrisActivePiece();
    renderNextPiecePreview();
    updateTetrisHUD();

    setTimeout(() => {
      if (!tetrisState.isOver) showNextTetrisQuestion();
    }, 700);
  }

  function finishTetris(victory) {
    stopTetrisMode();

    const lines = tetrisState.linesCleared;
    const starsAwarded = lines >= 10 ? 3 : lines >= 6 ? 2 : lines >= 3 ? 1 : 1;
    for (let i = 0; i < starsAwarded; i++) addStar();

    setTimeout(() => {
      showReward({
        emoji: starsAwarded === 3 ? '🏆' : starsAwarded === 2 ? '⭐' : '🧩',
        title: 'Magic Blocks Champion! 🎉',
        text: `You cleared ${lines} line${lines === 1 ? '' : 's'} and scored ${tetrisState.score} points with Teenieping magic! Earned ${starsAwarded} Star${starsAwarded > 1 ? 's' : ''}! ⭐`,
        earned: starsAwarded,
        total: 3,
        onClose: () => {
          showScreen('home');
        },
      });
    }, 500);
  }

  // Hook up Tetris buttons
  $$('.tetris-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.tap();
      const cat = btn.dataset.cat;
      startTetrisMode(cat);
    });
  });

  const btnTetrisRead = $('#btn-tetris-read');
  if (btnTetrisRead) {
    btnTetrisRead.addEventListener('click', () => {
      if (!tetrisState.question) return;
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const text = tetrisState.question.speechText || tetrisState.question.prompt;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(text, { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(text, { pitch: leader ? leader.pitch : 1.25, rate: leader ? leader.rate : 0.88 });
      }
    });
  }

  // ---------- Teenieping City Hero Controller ----------
  let cityHeroState = {
    currentCityId: null,
    currentStopIdx: 0,
    backpack: [],
    completedCities: {},
    activePuzzle: null,
    backpackFilter: 'all',
  };

  if (state.cityBackpack) cityHeroState.backpack = state.cityBackpack;
  if (state.cityCompleted) cityHeroState.completedCities = state.cityCompleted;

  function saveCityHeroState() {
    state.cityBackpack = cityHeroState.backpack;
    state.cityCompleted = cityHeroState.completedCities;
    save();
  }

  function renderCityHub() {
    const gridEl = $('#city-passport-grid');
    if (!gridEl || typeof CityHeroEngine === 'undefined') return;

    const cities = CityHeroEngine.getCities();
    gridEl.innerHTML = cities.map((city) => {
      const isCompleted = !!cityHeroState.completedCities[city.id];
      const visitedStops = cityHeroState.backpack.filter((item) => item.cityId === city.id).length;
      const flightMeta = typeof CityHeroEngine.getCityFlightMeta === 'function'
        ? CityHeroEngine.getCityFlightMeta(city)
        : { airport: city.country, flightNo: 'TP-101', weather: '☀️' };
      return `<div class="city-passport-card" id="city-card-${city.id}" data-city="${city.id}">
        <div class="city-card-header" style="background:${city.skyGradient}">
          <span class="city-card-flag-badge">${city.flag}</span>
          <span class="city-card-icon">${city.icon}</span>
          ${isCompleted ? '<span class="city-card-stamp">HERO STAMP 🏵️</span>' : ''}
        </div>
        <div class="city-card-body">
          <div class="city-boarding-line">
            <span class="boarding-code">✈️ ${flightMeta.flightNo}</span>
            <span class="boarding-airport">${flightMeta.airport}</span>
          </div>
          <h3 class="city-card-name">${city.name}</h3>
          <span class="city-card-country">${city.country} • ${city.currency} • ${flightMeta.weather}</span>
        </div>
        <div class="city-card-footer">
          <span class="city-card-progress">${isCompleted ? '⭐ 4/4 Explored' : `${visitedStops}/4 Stops`}</span>
          <button class="chip city-card-btn">${isCompleted ? 'Explore Again ✈️' : 'Fly Here ✈️'}</button>
        </div>
      </div>`;
    }).join('');

    $$('.city-passport-card').forEach((card) => {
      card.addEventListener('click', () => {
        Sound.airplaneWhoosh?.();
        const cityId = card.dataset.city;
        startCityMission(cityId);
      });
    });
  }

  function startCityMission(cityId) {
    if (typeof CityHeroEngine === 'undefined') return;
    const city = CityHeroEngine.getCity(cityId);
    if (!city) return;

    cityHeroState.currentCityId = cityId;
    cityHeroState.currentStopIdx = 0;
    cityHeroState.activePuzzle = null;

    showScreen('city-tour');

    const titleEl = $('#city-tour-title');
    if (titleEl) titleEl.textContent = `${city.name} Hero Tour ${city.icon}`;

    const flightMeta = typeof CityHeroEngine.getCityFlightMeta === 'function'
      ? CityHeroEngine.getCityFlightMeta(city)
      : null;
    if (flightMeta) {
      const codeEl = $('#city-flight-code');
      if (codeEl) codeEl.textContent = `✈️ Flight ${flightMeta.flightNo} • ${flightMeta.airport}`;
      const timeEl = $('#city-local-time');
      if (timeEl) timeEl.textContent = `🕒 ${flightMeta.localTime}`;
      const weatherEl = $('#city-local-weather');
      if (weatherEl) weatherEl.textContent = flightMeta.weather;
      const currEl = $('#city-currency-pill');
      if (currEl) currEl.textContent = `🪙 Currency: ${city.currency}`;
    }

    renderCityTourStop();

    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    const greeting = city.greeting || `Welcome to ${city.name}!`;
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => TeeniepingAudio.speakText(greeting, { charId: leader ? leader.id : 'heartsping' }), 300);
    } else {
      setTimeout(() => Speech.say(greeting), 300);
    }
  }

  function renderCityTourStop() {
    if (typeof CityHeroEngine === 'undefined') return;
    const city = CityHeroEngine.getCity(cityHeroState.currentCityId);
    if (!city) return;

    const stopIdx = cityHeroState.currentStopIdx;
    const stop = city.stops[stopIdx];
    if (!stop) return;

    const stepperEl = $('#city-tour-stepper');
    if (stepperEl) {
      stepperEl.innerHTML = city.stops.map((s, idx) => {
        const isCurrent = idx === stopIdx;
        const isDone = idx < stopIdx;
        const cls = isCurrent ? 'active' : isDone ? 'completed' : '';
        const icon = isDone ? '✅' : s.icon;
        return `<div class="tour-step-node ${cls}">
          <span>${icon}</span>
          <span>${(s.categoryLabel && s.categoryLabel.split(' ')[1]) || s.title}</span>
        </div>`;
      }).join('');
    }

    const catEl = $('#city-stop-category');
    if (catEl) catEl.textContent = stop.categoryLabel || stop.title;

    const camTag = $('#city-camera-tag');
    if (camTag) {
      camTag.textContent = stop.puzzleType === 'math' ? '🧾 MARKET COUNTER' : '📸 LANDMARK VIEWFINDER';
    }

    const dioramaEl = $('#city-stop-diorama');
    if (dioramaEl && typeof CityHeroEngine.getStopSceneSvg === 'function') {
      dioramaEl.innerHTML = CityHeroEngine.getStopSceneSvg(city, stop);
    }

    const bannerEl = $('#city-stop-banner');
    if (bannerEl && stop.bannerBg) bannerEl.style.background = stop.bannerBg;

    const iconEl = $('#city-stop-icon');
    if (iconEl) iconEl.textContent = stop.icon;

    const nameEl = $('#city-stop-name');
    if (nameEl) nameEl.textContent = stop.title;

    const factEl = $('#city-stop-fact');
    if (factEl) factEl.textContent = stop.fact;

    const rIconEl = $('#city-reward-icon');
    if (rIconEl) rIconEl.textContent = stop.reward.icon;

    const rNameEl = $('#city-reward-name');
    if (rNameEl) rNameEl.textContent = stop.reward.name;

    const rDescEl = $('#city-reward-desc');
    if (rDescEl) rDescEl.textContent = stop.reward.desc || `Authentic keepsake from ${city.name}!`;

    const bCountEl = $('#tour-backpack-count');
    if (bCountEl) bCountEl.textContent = cityHeroState.backpack.length;

    const puzzle = CityHeroEngine.makeStopPuzzle(city, stop);
    cityHeroState.activePuzzle = puzzle;

    const badgeEl = $('#city-q-badge');
    if (badgeEl) badgeEl.textContent = puzzle.type === 'reading' ? '📖 Reading Challenge' : '🔢 Math Market';

    const promptEl = $('#city-q-prompt');
    if (promptEl) promptEl.textContent = puzzle.prompt;

    const marketTray = $('#city-market-tray');
    if (marketTray) {
      if (puzzle.type === 'math') {
        const unitWord = (city.currency || 'Coins').split(' ')[0];
        const coinEmoji = (city.currency || '').includes('💵') ? '💵' : '🪙';
        const opLabel = stop.mathOp === '-' ? 'CHANGE DUE' : 'TOTAL COST';
        const tokensA = coinEmoji.repeat(Math.min(10, stop.mathA || 1));
        const tokensB = coinEmoji.repeat(Math.min(10, stop.mathB || 1));
        marketTray.hidden = false;
        marketTray.innerHTML = `
          <div class="market-receipt-row">
            <span class="receipt-col"><small>${stop.mathOp === '-' ? 'YOU PAY' : 'ITEM 1'}</small><b>${stop.mathA} ${unitWord}</b><span class="coin-row">${tokensA}</span></span>
            <span class="receipt-op">${stop.mathOp === '-' ? '−' : '+'}</span>
            <span class="receipt-col"><small>${stop.mathOp === '-' ? 'ITEM PRICE' : 'ITEM 2'}</small><b>${stop.mathB} ${unitWord}</b><span class="coin-row">${tokensB}</span></span>
            <span class="receipt-op">=</span>
            <span class="receipt-col total-col"><small>${opLabel}</small><b>? ${unitWord}</b></span>
          </div>`;
      } else {
        marketTray.hidden = true;
        marketTray.innerHTML = '';
      }
    }

    const feedbackBanner = $('#city-feedback-banner');
    if (feedbackBanner) feedbackBanner.hidden = true;

    const choicesEl = $('#city-q-choices');
    if (choicesEl) {
      choicesEl.innerHTML = puzzle.choices.map((c, i) =>
        `<button class="race-choice-btn" data-idx="${i}">${c.text}</button>`
      ).join('');

      $$('#city-q-choices .race-choice-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => handleCityStopChoice(puzzle.choices[idx], btn));
      });
    }

    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    const speechText = puzzle.speechText || puzzle.prompt;
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => {
        if (cityHeroState.activePuzzle === puzzle) {
          TeeniepingAudio.speakText(speechText, { charId: leader ? leader.id : 'heartsping' });
        }
      }, 400);
    } else {
      setTimeout(() => {
        if (cityHeroState.activePuzzle === puzzle) {
          Speech.say(speechText, { pitch: leader ? leader.pitch : 1.25, rate: leader ? leader.rate : 0.88 });
        }
      }, 400);
    }
  }

  function handleCityStopChoice(choice, btn) {
    const puzzle = cityHeroState.activePuzzle;
    if (!puzzle) return;

    const city = CityHeroEngine.getCity(cityHeroState.currentCityId);
    const stop = city.stops[cityHeroState.currentStopIdx];
    const banner = $('#city-feedback-banner');

    $$('#city-q-choices .race-choice-btn').forEach((b) => { b.disabled = true; });

    if (choice.isCorrect) {
      btn.classList.add('correct');
      if (puzzle.type === 'math') {
        Sound.cashRegister?.();
      } else {
        Sound.cameraShutter?.();
        const dioramaEl = $('#city-stop-diorama');
        if (dioramaEl) replayClass(dioramaEl, 'camera-flash');
      }
      Sound.fanfare?.();
      confetti(25);

      const alreadyCollected = cityHeroState.backpack.some((item) => item.id === stop.reward.id);
      if (!alreadyCollected) {
        cityHeroState.backpack.push({
          ...stop.reward,
          cityId: city.id,
          cityName: city.name,
          cityFlag: city.flag,
        });
        saveCityHeroState();
      }

      const bCountEl = $('#tour-backpack-count');
      if (bCountEl) bCountEl.textContent = cityHeroState.backpack.length;

      if (banner) {
        banner.hidden = false;
        banner.className = 'race-boost-banner super';
        banner.textContent = `🎉 Unlocked ${stop.reward.name}! Added to Backpack 🎒`;
      }

      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.playCheerWithSpeech(
          leader ? leader.id : 'heartsping',
          `Wonderful! You discovered ${stop.reward.name}, chuping!`,
          { pitch: leader?.pitch, rate: leader?.rate }
        );
      }

      if (typeof Teenieping !== 'undefined' && typeof Teenieping.stepQuestion === 'function') {
        Teenieping.stepQuestion();
      }

      setTimeout(() => {
        cityHeroState.currentStopIdx++;
        if (cityHeroState.currentStopIdx >= city.stops.length) {
          finishCityMission(city);
        } else {
          renderCityTourStop();
        }
      }, 1200);
    } else {
      btn.classList.add('wrong');
      Sound.wrong?.();

      if (banner) {
        banner.hidden = false;
        banner.className = 'race-boost-banner miss';
        banner.textContent = 'Keep trying! Read or calculate carefully! 💪';
      }

      setTimeout(() => {
        $$('#city-q-choices .race-choice-btn').forEach((b) => { b.disabled = false; });
        btn.classList.remove('wrong');
      }, 700);
    }
  }

  function finishCityMission(city) {
    cityHeroState.completedCities[city.id] = true;
    saveCityHeroState();

    for (let i = 0; i < 3; i++) addStar();

    setTimeout(() => {
      showReward({
        emoji: city.icon,
        title: `${city.name} Hero Stamp! 🏵️`,
        text: `Splendid world exploration! You explored all places of interest, tasted local street food, and collected authentic souvenirs in ${city.name}! Earned 3 Stars! ⭐⭐⭐`,
        earned: 3,
        total: 3,
        onClose: () => {
          showScreen('city-hub');
          renderCityHub();
        },
      });
    }, 500);
  }

  function showBackpackDialog(filter = 'all') {
    const dlg = $('#hero-backpack-dialog');
    const grid = $('#backpack-grid');
    if (!dlg || !grid) return;

    cityHeroState.backpackFilter = filter;

    $$('.backpack-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    const items = cityHeroState.backpack.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'souvenir') return item.type === 'souvenir' || item.type === 'culture';
      return item.type === filter;
    });

    if (items.length === 0) {
      grid.innerHTML = `<div class="backpack-empty-msg">
        🎒 Your Hero Scrapbook is empty! Explore world cities to collect famous landmarks, foods, and souvenirs!
      </div>`;
    } else {
      grid.innerHTML = items.map((item) => `
        <div class="backpack-item-card">
          <span class="backpack-item-icon">${item.icon}</span>
          <b class="backpack-item-name">${item.name}</b>
          <span class="backpack-item-city">${item.cityFlag || '🌍'} ${item.cityName || ''}</span>
        </div>
      `).join('');
    }

    dlg.showModal();
  }

  // Hook up City Hero buttons
  const btnOpenBackpack = $('#btn-open-backpack');
  if (btnOpenBackpack) btnOpenBackpack.addEventListener('click', () => showBackpackDialog('all'));

  const btnTourBackpack = $('#btn-tour-backpack');
  if (btnTourBackpack) btnTourBackpack.addEventListener('click', () => showBackpackDialog('all'));

  const btnCloseBackpack = $('#btn-close-backpack');
  if (btnCloseBackpack) btnCloseBackpack.addEventListener('click', () => $('#hero-backpack-dialog')?.close());

  const btnCityTourBack = $('#btn-city-tour-back');
  if (btnCityTourBack) {
    btnCityTourBack.addEventListener('click', () => {
      Sound.tap();
      showScreen('city-hub');
      renderCityHub();
    });
  }

  $$('.backpack-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.tap();
      showBackpackDialog(btn.dataset.filter);
    });
  });

  const btnCityQRead = $('#btn-city-q-read');
  if (btnCityQRead) {
    btnCityQRead.addEventListener('click', () => {
      const puzzle = cityHeroState.activePuzzle;
      if (!puzzle) return;
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const text = puzzle.speechText || puzzle.prompt;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(text, { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(text, { pitch: leader ? leader.pitch : 1.25, rate: leader ? leader.rate : 0.88 });
      }
    });
  }

  // ---------- Teenieping Sweet Bakery Controller ----------
  let bakeryState = {
    category: 'mix',
    ordersCompleted: 0,
    currentOrder: null,
    question: null,
    bakedShowcase: [],
    isLocked: false,
  };

  function startBakeryMode(category) {
    if (category) bakeryState.category = category;
    if (typeof BakeryEngine === 'undefined') return;

    bakeryState.ordersCompleted = 0;
    bakeryState.bakedShowcase = [];
    bakeryState.isLocked = false;

    $$('.bakery-cat-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.cat === bakeryState.category);
    });

    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    bakeryState.currentOrder = BakeryEngine.pickOrder(1, leader ? leader.id : null, null);

    renderBakeryUI();
    showNextBakeryQuestion();

    const welcomeMsg = 'Welcome to Harmony Town Sweet Bakery! Let us measure, frost, and bake delicious treats, chuping!';
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => TeeniepingAudio.speakText(welcomeMsg, { charId: leader ? leader.id : 'heartsping' }), 280);
    } else {
      setTimeout(() => Speech.say(welcomeMsg), 280);
    }
  }

  function renderBakeryUI() {
    if (typeof BakeryEngine === 'undefined' || !bakeryState.currentOrder) return;
    const order = bakeryState.currentOrder;
    const recipe = order.recipe;
    const stepMeta = BakeryEngine.getStepMetadata(order.currentStep);

    const badgeOrders = $('#bakery-orders-badge');
    if (badgeOrders) {
      badgeOrders.innerHTML = `Orders: <b>${bakeryState.ordersCompleted}</b>/${BakeryEngine.TARGET_ORDERS_FOR_VICTORY} 🧁`;
    }

    const ticketNo = $('#bakery-ticket-no');
    if (ticketNo) ticketNo.textContent = `ORDER #${order.orderNo}`;

    const ticketCust = $('#bakery-ticket-customer');
    if (ticketCust) ticketCust.textContent = `${recipe.customerSymbol} ${recipe.customerName}`;

    const ticketPrice = $('#bakery-ticket-price');
    if (ticketPrice) ticketPrice.textContent = `🪙 ${recipe.priceCoins} Coins`;

    const dIcon = $('#bakery-dessert-icon');
    if (dIcon) dIcon.textContent = recipe.icon;

    const dName = $('#bakery-dessert-name');
    if (dName) dName.textContent = recipe.name;

    const dDesc = $('#bakery-dessert-desc');
    if (dDesc) dDesc.textContent = recipe.desc;

    const stepsTrack = $('#bakery-steps-track');
    if (stepsTrack) {
      const labels = ['1. 🥣 Batter', '2. 🍦 Frosting', '3. 🍓 Garnish'];
      stepsTrack.innerHTML = labels.map((lbl, idx) => {
        const cls = idx < order.currentStep ? 'done' : idx === order.currentStep ? 'active' : '';
        const prefix = idx < order.currentStep ? '✅ ' : '';
        return `<span class="ticket-step ${cls}">${prefix}${lbl}</span>`;
      }).join('');
    }

    const stationPill = $('#bakery-station-pill');
    if (stationPill && stepMeta) stationPill.textContent = `🥣 ${stepMeta.station}`;

    const ovenPill = $('#bakery-oven-pill');
    if (ovenPill && stepMeta) ovenPill.textContent = `🌡️ ${stepMeta.ovenTemp}`;

    const stageBox = $('#bakery-stage-box');
    if (stageBox) {
      stageBox.innerHTML = BakeryEngine.renderKitchenSvg(order);
    }

    const shelfEl = $('#bakery-showcase-shelf');
    if (shelfEl) {
      if (bakeryState.bakedShowcase.length === 0) {
        shelfEl.innerHTML = `<span class="showcase-empty">Complete 3 steps to display your first fresh pastry!</span>`;
      } else {
        shelfEl.innerHTML = bakeryState.bakedShowcase.map((item) => `
          <div class="showcase-pastry-pill">
            <span class="pastry-pill-icon">${item.icon}</span>
            <div class="pastry-pill-meta">
              <b>${item.name}</b>
              <small>${item.customerSymbol} ${item.customerName} • 🪙 ${item.priceCoins}</small>
            </div>
          </div>
        `).join('');
      }
    }
  }

  function showNextBakeryQuestion() {
    if (typeof BakeryEngine === 'undefined' || !bakeryState.currentOrder) return;
    bakeryState.isLocked = false;

    const q = BakeryEngine.makeStepQuestion(
      bakeryState.category,
      bakeryState.currentOrder,
      typeof MathEngine !== 'undefined' ? MathEngine : null,
      typeof WORD_LEVELS !== 'undefined' ? WORD_LEVELS : null,
      typeof RaceEngine !== 'undefined' ? RaceEngine : null
    );
    bakeryState.question = q;

    const badgeEl = $('#bakery-q-badge');
    if (badgeEl) badgeEl.textContent = q.badge || '🥣 Kitchen Step';

    const promptEl = $('#bakery-q-prompt');
    if (promptEl) promptEl.textContent = q.prompt;

    const bannerEl = $('#bakery-banner');
    if (bannerEl) bannerEl.hidden = true;

    const choicesEl = $('#bakery-choices');
    if (choicesEl) {
      choicesEl.innerHTML = q.choices.map((c, i) =>
        `<button class="race-choice-btn" data-idx="${i}">${c.text}</button>`
      ).join('');

      $$('#bakery-choices .race-choice-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => handleBakeryChoice(q.choices[idx], btn));
      });
    }
  }

  function handleBakeryChoice(choice, btn) {
    if (bakeryState.isLocked || !bakeryState.currentOrder || !bakeryState.question) return;
    const order = bakeryState.currentOrder;
    const banner = $('#bakery-banner');

    if (choice.isCorrect) {
      bakeryState.isLocked = true;
      btn.classList.add('correct');
      $$('#bakery-choices .race-choice-btn').forEach((b) => { b.disabled = true; });

      const stepMeta = BakeryEngine.getStepMetadata(order.currentStep);
      order.currentStep++;

      renderBakeryUI();
      const stageFrame = $('#bakery-stage-frame');
      if (stageFrame) replayClass(stageFrame, 'pop');

      if (order.currentStep >= BakeryEngine.STEPS_PER_ORDER) {
        // Order finished!
        Sound.ovenDing?.();
        Sound.cashRegister?.();
        confetti(35);

        bakeryState.ordersCompleted++;
        bakeryState.bakedShowcase.push({ ...order.recipe });
        renderBakeryUI();

        if (banner) {
          banner.hidden = false;
          banner.className = 'race-boost-banner super';
          banner.textContent = `🎂 Order #${order.orderNo} Complete! Served ${order.recipe.name} to ${order.recipe.customerName}!`;
        }

        const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.playCheerWithSpeech(
            leader ? leader.id : 'heartsping',
            `Order up! ${order.recipe.name} is baked to perfection!`,
            { pitch: leader?.pitch, rate: leader?.rate }
          );
        }

        if (typeof Teenieping !== 'undefined' && typeof Teenieping.stepQuestion === 'function') {
          Teenieping.stepQuestion();
        }

        setTimeout(() => {
          if (bakeryState.ordersCompleted >= BakeryEngine.TARGET_ORDERS_FOR_VICTORY) {
            finishBakeryShift();
          } else {
            const nextLeader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
            bakeryState.currentOrder = BakeryEngine.pickOrder(
              bakeryState.ordersCompleted + 1,
              nextLeader ? nextLeader.id : null,
              order.recipe.id
            );
            renderBakeryUI();
            showNextBakeryQuestion();
          }
        }, 1250);
      } else {
        // Intermediate step finished
        Sound.correct?.();
        if (banner && stepMeta) {
          banner.hidden = false;
          banner.className = 'race-boost-banner turbo';
          banner.textContent = `✨ ${stepMeta.actionVerb}`;
        }

        if (typeof Teenieping !== 'undefined' && typeof Teenieping.stepQuestion === 'function') {
          Teenieping.stepQuestion();
        }

        setTimeout(() => {
          showNextBakeryQuestion();
        }, 850);
      }
    } else {
      order.mistakes++;
      btn.classList.add('wrong');
      btn.disabled = true;
      Sound.wrong?.();

      if (banner) {
        banner.hidden = false;
        banner.className = 'race-boost-banner miss';
        banner.textContent = '💨 Puff of flour! Check the recipe measurement and try again!';
      }
    }
  }

  function finishBakeryShift() {
    for (let i = 0; i < 3; i++) addStar();
    Sound.fanfare?.();

    setTimeout(() => {
      showReward({
        emoji: '👩‍🍳',
        title: 'Master Pastry Chef! 🎂',
        text: `Delicious work! You baked and served all ${BakeryEngine.TARGET_ORDERS_FOR_VICTORY} royal Teenieping dessert orders and earned 3 Stars! ⭐⭐⭐`,
        earned: 3,
        total: 3,
        onClose: () => {
          showScreen('home');
        },
      });
    }, 450);
  }

  $$('.bakery-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.tap();
      startBakeryMode(btn.dataset.cat);
    });
  });

  const btnBakeryRead = $('#btn-bakery-read');
  if (btnBakeryRead) {
    btnBakeryRead.addEventListener('click', () => {
      if (!bakeryState.question) return;
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const text = bakeryState.question.speechText || bakeryState.question.prompt;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(text, { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(text, { pitch: leader ? leader.pitch : 1.25, rate: leader ? leader.rate : 0.88 });
      }
    });
  }

  // ---------- Teenieping Super Jump Run (Mario-Style Platformer) Controller ----------
  let platformerState = {
    category: 'mix',
    worldIdx: 0,
    run: null,
    question: null,
    questionStartTime: 0,
    animState: 'idle',
    isLocked: false,
  };

  function startPlatformerMode(category) {
    if (category) platformerState.category = category;
    if (typeof PlatformerEngine === 'undefined') return;

    const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
    platformerState.run = PlatformerEngine.createRunState(leader, platformerState.worldIdx);
    platformerState.animState = 'idle';
    platformerState.isLocked = false;

    $$('.platformer-cat-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.cat === platformerState.category);
    });

    renderPlatformerUI();
    showNextPlatformerQuestion();

    const msg = 'Super Jump Run! Hit the right Mystery Block to jump over pipes and reach the Castle Flagpole, chuping!';
    if (typeof TeeniepingAudio !== 'undefined') {
      setTimeout(() => TeeniepingAudio.speakText(msg, { charId: leader ? leader.id : 'heartsping' }), 280);
    } else {
      setTimeout(() => Speech.say(msg), 280);
    }
  }

  function renderPlatformerUI() {
    if (typeof PlatformerEngine === 'undefined' || !platformerState.run) return;
    const run = platformerState.run;

    const flagBadge = $('#platformer-flag-badge');
    if (flagBadge) {
      flagBadge.innerHTML = `Blocks: <b>${run.checkpoint}</b>/${run.totalCheckpoints} 🚩`;
    }

    const scoreEl = $('#platformer-score-val');
    if (scoreEl) scoreEl.textContent = String(run.score).padStart(6, '0');

    const coinsEl = $('#platformer-coins-val');
    if (coinsEl) coinsEl.textContent = `🪙 x${String(run.coins).padStart(2, '0')}`;

    const worldEl = $('#platformer-world-val');
    if (worldEl) worldEl.textContent = run.world.id;

    const powerEl = $('#platformer-power-val');
    if (powerEl) {
      const powerMap = {
        normal: '👟 NORMAL',
        mushroom: '🍄 SUPER BIG',
        star: '🌟 INVINCIBLE',
      };
      powerEl.textContent = powerMap[run.powerUp] || '👟 NORMAL';
    }

    const stageBox = $('#platformer-stage-box');
    if (stageBox) {
      stageBox.innerHTML = PlatformerEngine.renderStageSvg(run, platformerState.animState);
    }

    const trackEl = $('#platformer-course-track');
    if (trackEl) {
      const nodes = [];
      for (let i = 0; i < run.totalCheckpoints; i++) {
        const obs = run.obstacles[i];
        const isCurrent = i === run.checkpoint && !run.finished;
        const isCleared = i < run.checkpoint || run.finished;
        const cls = isCleared ? 'cleared' : isCurrent ? 'current' : '';
        const icon = isCleared ? '🪙' : isCurrent ? run.heroSymbol : obs.icon;
        nodes.push(`<span class="course-node ${cls}" title="Checkpoint ${i + 1}">${icon}</span>`);
      }
      nodes.push(`<span class="course-node castle ${run.finished ? 'cleared' : ''}">🚩🏰</span>`);
      trackEl.innerHTML = nodes.join('');
    }
  }

  function showNextPlatformerQuestion() {
    if (typeof PlatformerEngine === 'undefined' || !platformerState.run) return;
    platformerState.isLocked = false;
    platformerState.animState = 'idle';
    renderPlatformerUI();

    const q = PlatformerEngine.makeBlockQuestion(
      platformerState.category,
      typeof MathEngine !== 'undefined' ? MathEngine : null,
      typeof WORD_LEVELS !== 'undefined' ? WORD_LEVELS : null,
      typeof RaceEngine !== 'undefined' ? RaceEngine : null
    );
    platformerState.question = q;
    platformerState.questionStartTime = Date.now();

    const badgeEl = $('#platformer-q-badge');
    if (badgeEl) badgeEl.textContent = q.badge || '🧱 [?] MYSTERY BLOCK';

    const promptEl = $('#platformer-q-prompt');
    if (promptEl) promptEl.textContent = q.prompt;

    const bannerEl = $('#platformer-banner');
    if (bannerEl) bannerEl.hidden = true;

    const choicesEl = $('#platformer-choices');
    if (choicesEl) {
      choicesEl.innerHTML = q.choices.map((c, i) =>
        `<button class="race-choice-btn mario-q-block" data-idx="${i}">
          <span class="q-block-rivets" aria-hidden="true">?</span>
          <span class="q-block-val">${c.text}</span>
        </button>`
      ).join('');

      $$('#platformer-choices .mario-q-block').forEach((btn, idx) => {
        btn.addEventListener('click', () => handlePlatformerChoice(q.choices[idx], btn));
      });
    }
  }

  function handlePlatformerChoice(choice, btn) {
    if (platformerState.isLocked || !platformerState.run || !platformerState.question) return;
    const duration = (Date.now() - platformerState.questionStartTime) / 1000;
    const res = PlatformerEngine.applyJumpResult(platformerState.run, choice.isCorrect, duration);
    const banner = $('#platformer-banner');

    if (choice.isCorrect) {
      platformerState.isLocked = true;
      btn.classList.add('correct');
      $$('#platformer-choices .mario-q-block').forEach((b) => { b.disabled = true; });

      platformerState.animState = res.action;
      renderPlatformerUI();

      Sound.jump?.();
      setTimeout(() => Sound.coinBlock?.(), 110);
      if (res.powerUpEarned) {
        setTimeout(() => Sound.powerUp?.(), 220);
      }

      if (banner) {
        banner.hidden = false;
        banner.className = `race-boost-banner ${res.action === 'star-leap' || res.finished ? 'super' : 'turbo'}`;
        banner.textContent = res.callout;
      }

      if (typeof Teenieping !== 'undefined' && typeof Teenieping.stepQuestion === 'function') {
        Teenieping.stepQuestion();
      }

      if (res.finished) {
        confetti(45);
        const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
        if (typeof TeeniepingAudio !== 'undefined') {
          TeeniepingAudio.playCheerWithSpeech(
            leader ? leader.id : 'heartsping',
            'Yahoo! Top of the flagpole! You cleared the kingdom!',
            { pitch: leader?.pitch, rate: leader?.rate }
          );
        }
        setTimeout(() => {
          platformerState.worldIdx = (platformerState.worldIdx + 1) % PlatformerEngine.WORLDS.length;
          finishPlatformerRun();
        }, 1250);
      } else {
        setTimeout(() => {
          showNextPlatformerQuestion();
        }, 900);
      }
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      platformerState.animState = 'pipe-bump';
      renderPlatformerUI();
      Sound.pipeBump?.();

      if (banner) {
        banner.hidden = false;
        banner.className = 'race-boost-banner miss';
        banner.textContent = res.callout;
      }
    }
  }

  function finishPlatformerRun() {
    for (let i = 0; i < 3; i++) addStar();
    Sound.fanfare?.();

    const run = platformerState.run;
    setTimeout(() => {
      showReward({
        emoji: '🍄',
        title: `${run ? run.world.name : 'Kingdom'} Cleared! 🚩`,
        text: `Super jumping! You collected ${run ? run.coins : 0} Golden Coins, scored ${run ? run.score : 0} points, and reached the Star Castle! Earned 3 Stars! ⭐⭐⭐`,
        earned: 3,
        total: 3,
        onClose: () => {
          showScreen('home');
        },
      });
    }, 450);
  }

  $$('.platformer-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.tap();
      startPlatformerMode(btn.dataset.cat);
    });
  });

  const btnPlatformerRead = $('#btn-platformer-read');
  if (btnPlatformerRead) {
    btnPlatformerRead.addEventListener('click', () => {
      if (!platformerState.question) return;
      const leader = typeof Teenieping !== 'undefined' ? Teenieping.getLeader() : null;
      const text = platformerState.question.speechText || platformerState.question.prompt;
      if (typeof TeeniepingAudio !== 'undefined') {
        TeeniepingAudio.speakText(text, { charId: leader ? leader.id : 'heartsping' });
      } else {
        Speech.say(text, { pitch: leader ? leader.pitch : 1.25, rate: leader ? leader.rate : 0.88 });
      }
    });
  }

  // ---------- Boot ----------
  makeSky();
  buildPad();
  renderWordLevels();
  renderStoryShelf();
  Speech.init();
  applyVoice();
  refreshStars();
  if (typeof Teenieping !== 'undefined') initTeenieping();

  // Smart protocol detection when index.html is opened directly via file://
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    fetch('http://localhost:8642/api/health')
      .then((res) => {
        if (res.ok) {
          window.location.replace('http://localhost:8642/');
        }
      })
      .catch(() => {
        const banner = $('#launcher-tip-banner');
        if (banner) banner.hidden = false;
      });
  }

  const closeTipBtn = $('#btn-close-launcher-tip');
  if (closeTipBtn) {
    closeTipBtn.addEventListener('click', () => {
      const banner = $('#launcher-tip-banner');
      if (banner) banner.hidden = true;
    });
  }
})();
