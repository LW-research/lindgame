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

  // Column layout with one cell per place value, biggest place on the left.
  function renderColumn(p) {
    const width = mission.digits.length;
    const places = Array.from({ length: width }, (_, k) => width - 1 - k); // e.g. [3, 2, 1, 0]
    const cells = (n) => {
      const d = MathEngine.digitsOf(n);
      return places.map((i) => `<span class="d p${i}">${d[i] ?? ''}</span>`).join('');
    };
    const el = $('#column-sum');
    el.className = 'column-sum';
    el.style.setProperty('--cols', width);
    el.setAttribute('aria-label', `${p.a} ${opWord(p)} ${p.b}`);
    el.innerHTML = `
      <div class="col-head"><span></span>${places.map((i) => `<span class="p${i}">${PLACE_NAMES[i]}</span>`).join('')}</div>
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
