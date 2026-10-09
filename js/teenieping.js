/* Catch! Teenieping (캐치! 티니핑) Cartoon Theme & Dynamic Leader Companion
   Manages the 6 Teenieping character companions, dynamic switching, SVG avatars,
   and character-specific vocal profiles for beginning learners.
   Works in browser (window.Teenieping) and Node.js (module.exports). */
(function (root) {
  'use strict';

  const TEENIEPINGS = [
    {
      id: 'heartsping',
      name: 'Heartsping',
      koreanName: '하츄핑',
      title: 'Teenieping of Love',
      accent: '#ff6b9d',
      bgGlow: 'rgba(255, 107, 157, 0.4)',
      symbol: '💖',
      pitch: 1.35,
      rate: 0.90,
      catchphrase: 'Heart power! Chuping!',
      greeting: "Hi there! I am Heartsping! Let's fill today with love and sparkles, chuping! 💖",
      cheers: [
        'Heart power! You did it, chuping! 💖',
        'Wonderful job! Your heart shines so bright! ✨',
        'Yay! That was lovely! Chuping! 🌟',
        'Super sweet! Keep going with all your heart! 🌸',
      ],
      hints: [
        "Let's think with a happy heart! We can do it together, chuping! 💕",
        'Take your time! Heartsping is right here cheering for you! 💖',
      ],
      avatarSvg: `<svg viewBox="0 0 100 100" class="tp-svg" aria-hidden="true">
        <defs>
          <radialGradient id="tp-bg-heart" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#fff0f5"/><stop offset="100%" stop-color="#ffb6c1"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#tp-bg-heart)" stroke="#ff6b9d" stroke-width="4"/>
        <!-- Ribbon / Hair buns -->
        <circle cx="28" cy="24" r="14" fill="#ff4d84"/>
        <circle cx="72" cy="24" r="14" fill="#ff4d84"/>
        <circle cx="28" cy="24" r="7" fill="#ff85ab"/>
        <circle cx="72" cy="24" r="7" fill="#ff85ab"/>
        <!-- Face -->
        <circle cx="50" cy="54" r="32" fill="#fff7fa"/>
        <!-- Blush -->
        <ellipse cx="32" cy="62" rx="7" ry="4" fill="#ff99bb" opacity="0.65"/>
        <ellipse cx="68" cy="62" rx="7" ry="4" fill="#ff99bb" opacity="0.65"/>
        <!-- Eyes -->
        <ellipse cx="38" cy="50" rx="5" ry="7" fill="#4a1525"/>
        <ellipse cx="62" cy="50" rx="5" ry="7" fill="#4a1525"/>
        <circle cx="36" cy="47" r="2.5" fill="#fff"/>
        <circle cx="60" cy="47" r="2.5" fill="#fff"/>
        <circle cx="40" cy="53" r="1.2" fill="#ff85ab"/>
        <circle cx="64" cy="53" r="1.2" fill="#ff85ab"/>
        <!-- Smile -->
        <path d="M45 61 Q50 67 55 61" stroke="#ff4d84" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Center Heart Gem -->
        <path d="M50 26 C47 21 41 21 41 26 C41 31 50 37 50 37 C50 37 59 31 59 26 C59 21 53 21 50 26 Z" fill="#ff1a66"/>
      </svg>`,
    },
    {
      id: 'lalaping',
      name: 'Lalaping',
      koreanName: '라라핑',
      title: 'Teenieping of Joy & Music',
      accent: '#ffc83b',
      bgGlow: 'rgba(255, 200, 59, 0.45)',
      symbol: '🎵',
      pitch: 1.42,
      rate: 0.95,
      catchphrase: 'Lala! Sing with joy!',
      greeting: "Hello, superstar! Lalaping is here! Let's make learning sing with joy, lala! 🎵",
      cheers: [
        'Lala! That answer was music to my ears! 🎶',
        'Super star dancer! You got it right, lala! ⭐',
        'Bravo! A perfect melody! Lala! 🎤',
        'Joyful, joyful! Keep dancing through the questions! 💃',
      ],
      hints: [
        'Listen to the rhythm! Lalaping is singing for you, lala! 🎵',
        'Take a happy breath and try again! Lalaping believes in you! 🎶',
      ],
      avatarSvg: `<svg viewBox="0 0 100 100" class="tp-svg" aria-hidden="true">
        <defs>
          <radialGradient id="tp-bg-lala" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#fffde6"/><stop offset="100%" stop-color="#ffe680"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#tp-bg-lala)" stroke="#f5a623" stroke-width="4"/>
        <!-- Purple hair twirls -->
        <path d="M22 24 C14 36 28 44 26 50" stroke="#9b51e0" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M78 24 C86 36 72 44 74 50" stroke="#9b51e0" stroke-width="7" fill="none" stroke-linecap="round"/>
        <!-- Face -->
        <circle cx="50" cy="54" r="32" fill="#fffdf5"/>
        <!-- Blush -->
        <ellipse cx="32" cy="62" rx="7" ry="4" fill="#ffb84d" opacity="0.6"/>
        <ellipse cx="68" cy="62" rx="7" ry="4" fill="#ffb84d" opacity="0.6"/>
        <!-- Eyes -->
        <ellipse cx="38" cy="50" rx="5" ry="7" fill="#3a1c54"/>
        <ellipse cx="62" cy="50" rx="5" ry="7" fill="#3a1c54"/>
        <circle cx="36" cy="47" r="2.5" fill="#fff"/>
        <circle cx="60" cy="47" r="2.5" fill="#fff"/>
        <circle cx="40" cy="53" r="1.2" fill="#bb6bd9"/>
        <circle cx="64" cy="53" r="1.2" fill="#bb6bd9"/>
        <!-- Smile -->
        <path d="M44 61 Q50 68 56 61" stroke="#e08a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Music Note Hairpin -->
        <circle cx="48" cy="25" r="4" fill="#9b51e0"/>
        <circle cx="58" cy="22" r="4" fill="#9b51e0"/>
        <path d="M52 25 L52 14 L62 11 L62 22" stroke="#9b51e0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`,
    },
    {
      id: 'chachaping',
      name: 'Chachaping',
      koreanName: '차차핑',
      title: 'Teenieping of Hope',
      accent: '#40c97b',
      bgGlow: 'rgba(64, 201, 123, 0.4)',
      symbol: '🍀',
      pitch: 1.22,
      rate: 0.86,
      catchphrase: 'Hope blooms! Chacha!',
      greeting: "Hello, little friend! Chachaping is here! Hope always blooms bright, chacha! 🍀",
      cheers: [
        'Hope bloomed right on target, chacha! 🍀',
        'Wonderful! You grew smarter with every step! 🌱',
        'Chacha! Fresh, green, and perfect! 🌿',
        'You have so much patience! That was amazing, chacha! 🌸',
      ],
      hints: [
        'Let your mind rest like gentle grass. Hope is always here, chacha! 🍀',
        'Water your thinking can and try once more! You can do it! 💧',
      ],
      avatarSvg: `<svg viewBox="0 0 100 100" class="tp-svg" aria-hidden="true">
        <defs>
          <radialGradient id="tp-bg-chacha" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ebfff3"/><stop offset="100%" stop-color="#b6f2ce"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#tp-bg-chacha)" stroke="#40c97b" stroke-width="4"/>
        <!-- Leafy hair wings -->
        <path d="M25 28 C15 16 35 12 38 28 Z" fill="#27ae60"/>
        <path d="M75 28 C85 16 65 12 62 28 Z" fill="#27ae60"/>
        <!-- Face -->
        <circle cx="50" cy="54" r="32" fill="#fafffc"/>
        <!-- Blush -->
        <ellipse cx="32" cy="62" rx="7" ry="4" fill="#6fcf97" opacity="0.6"/>
        <ellipse cx="68" cy="62" rx="7" ry="4" fill="#6fcf97" opacity="0.6"/>
        <!-- Eyes -->
        <ellipse cx="38" cy="50" rx="5" ry="7" fill="#1b4d3e"/>
        <ellipse cx="62" cy="50" rx="5" ry="7" fill="#1b4d3e"/>
        <circle cx="36" cy="47" r="2.5" fill="#fff"/>
        <circle cx="60" cy="47" r="2.5" fill="#fff"/>
        <circle cx="40" cy="53" r="1.2" fill="#56ccf2"/>
        <circle cx="64" cy="53" r="1.2" fill="#56ccf2"/>
        <!-- Smile -->
        <path d="M45 61 Q50 67 55 61" stroke="#219653" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Four Leaf Clover Emblem -->
        <circle cx="47" cy="23" r="4" fill="#219653"/>
        <circle cx="53" cy="23" r="4" fill="#219653"/>
        <circle cx="47" cy="29" r="4" fill="#219653"/>
        <circle cx="53" cy="29" r="4" fill="#219653"/>
        <circle cx="50" cy="26" r="2" fill="#fff"/>
      </svg>`,
    },
    {
      id: 'gogoping',
      name: 'Gogoping',
      koreanName: '아자핑',
      title: 'Teenieping of Courage',
      accent: '#ff7b47',
      bgGlow: 'rgba(255, 123, 71, 0.45)',
      symbol: '🔥',
      pitch: 1.15,
      rate: 0.95,
      catchphrase: 'Never give up! Gogo!',
      greeting: "Aza! Gogoping reporting for duty! Brave heroes never give up, gogo! 🔥",
      cheers: [
        'Aza! High five! Brave and brilliant, gogo! 💥',
        'Powerful thinking! You smashed that challenge! 🔥',
        'Never giving up always wins! Hero power! 🏆',
        'Whoosh! Full speed ahead! Gogo! 🚀',
      ],
      hints: [
        'Stand tall and take courage! We tackle big numbers together, gogo! 🔥',
        'Shake off the dust and try again! A true hero keeps going! 🥊',
      ],
      avatarSvg: `<svg viewBox="0 0 100 100" class="tp-svg" aria-hidden="true">
        <defs>
          <radialGradient id="tp-bg-gogo" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#fff5eb"/><stop offset="100%" stop-color="#ffd5b8"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#tp-bg-gogo)" stroke="#ff7b47" stroke-width="4"/>
        <!-- Brave flame tuft -->
        <path d="M50 12 C44 22 40 26 44 32 C48 30 52 26 50 12 Z" fill="#eb5757"/>
        <path d="M50 12 C56 22 60 26 56 32 C52 30 48 26 50 12 Z" fill="#f2994a"/>
        <!-- Face -->
        <circle cx="50" cy="54" r="32" fill="#fffbf7"/>
        <!-- Headband -->
        <path d="M22 44 Q50 38 78 44" stroke="#2f80ed" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- Blush -->
        <ellipse cx="32" cy="62" rx="7" ry="4" fill="#ff7b47" opacity="0.6"/>
        <ellipse cx="68" cy="62" rx="7" ry="4" fill="#ff7b47" opacity="0.6"/>
        <!-- Eyes (Brave shape) -->
        <ellipse cx="38" cy="51" rx="5" ry="6.5" fill="#1b2a47"/>
        <ellipse cx="62" cy="51" rx="5" ry="6.5" fill="#1b2a47"/>
        <circle cx="36" cy="48" r="2.5" fill="#fff"/>
        <circle cx="60" cy="48" r="2.5" fill="#fff"/>
        <!-- Confident Smile -->
        <path d="M44 61 Q50 69 56 61" stroke="#d04414" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`,
    },
    {
      id: 'dadaping',
      name: 'Dadaping',
      koreanName: '바로핑',
      title: 'Teenieping of Sincerity & Wisdom',
      accent: '#4ea8de',
      bgGlow: 'rgba(78, 168, 222, 0.4)',
      symbol: '📖',
      pitch: 1.10,
      rate: 0.88,
      catchphrase: 'Proper and neat! Dada!',
      greeting: "Greetings! Dadaping is at your service. Let us learn with wisdom and care, dada! 📖",
      cheers: [
        'Proper, neat, and correct! Wonderfully done, dada! 📘',
        'Splendid logic! Your mind is razor sharp! 💡',
        'Excellently executed! Just as planned, dada! ✨',
        'Neat and tidy! That is how a scholar does it! 🎓',
      ],
      hints: [
        'Check each column carefully, step by step, dada! 🔍',
        'Take your pencil and calculate gently. Wisdom will guide you! 📖',
      ],
      avatarSvg: `<svg viewBox="0 0 100 100" class="tp-svg" aria-hidden="true">
        <defs>
          <radialGradient id="tp-bg-dada" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#edf7ff"/><stop offset="100%" stop-color="#bfe4fc"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#tp-bg-dada)" stroke="#4ea8de" stroke-width="4"/>
        <!-- Royal Blue Beret / Hair -->
        <path d="M26 34 C26 18 74 18 74 34 Z" fill="#2b5c8f"/>
        <circle cx="50" cy="18" r="4" fill="#ffd166"/>
        <!-- Face -->
        <circle cx="50" cy="54" r="32" fill="#fafcff"/>
        <!-- Polite Glasses -->
        <circle cx="37" cy="49" r="8" fill="none" stroke="#2b5c8f" stroke-width="2.5"/>
        <circle cx="63" cy="49" r="8" fill="none" stroke="#2b5c8f" stroke-width="2.5"/>
        <line x1="45" y1="49" x2="55" y2="49" stroke="#2b5c8f" stroke-width="2.5"/>
        <!-- Eyes -->
        <circle cx="37" cy="49" r="3.5" fill="#1b365d"/>
        <circle cx="63" cy="49" r="3.5" fill="#1b365d"/>
        <circle cx="35" cy="47" r="1.5" fill="#fff"/>
        <circle cx="61" cy="47" r="1.5" fill="#fff"/>
        <!-- Polite Smile -->
        <path d="M46 62 Q50 66 54 62" stroke="#2b5c8f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <!-- Book Tie / Collar -->
        <path d="M44 80 L50 74 L56 80 L50 86 Z" fill="#ffd166"/>
      </svg>`,
    },
    {
      id: 'happyping',
      name: 'Happyping',
      koreanName: '해피핑',
      title: 'Teenieping of Pure Happiness',
      accent: '#d668ff',
      bgGlow: 'rgba(214, 104, 255, 0.42)',
      symbol: '🫧',
      pitch: 1.30,
      rate: 0.92,
      catchphrase: 'Bubbles of happiness! Happyping!',
      greeting: "Yaaaay! Happyping has arrived! Pop, pop, bubbles of happiness everywhere! 🫧",
      cheers: [
        'Pop, pop! That answer popped with happiness! 🫧',
        'Woohoo! So cheerful and so right! Happyping! 🍭',
        'Sparkly happy smiles for you! You got it! 🌈',
        'Happiness meter is 100% full! Wonderful, happyping! 🎉',
      ],
      hints: [
        'Do not worry, be happy! Pop a magic bubble and try again! 🫧',
        'Big smiling breaths! Happyping is holding your hand! 🎈',
      ],
      avatarSvg: `<svg viewBox="0 0 100 100" class="tp-svg" aria-hidden="true">
        <defs>
          <radialGradient id="tp-bg-happy" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#fdf4ff"/><stop offset="100%" stop-color="#f3caff"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#tp-bg-happy)" stroke="#d668ff" stroke-width="4"/>
        <!-- Bubble hair puffs -->
        <circle cx="26" cy="26" r="13" fill="#e289ff"/>
        <circle cx="74" cy="26" r="13" fill="#e289ff"/>
        <circle cx="50" cy="18" r="9" fill="#e289ff"/>
        <circle cx="28" cy="24" r="4" fill="#fff" opacity="0.6"/>
        <circle cx="76" cy="24" r="4" fill="#fff" opacity="0.6"/>
        <!-- Face -->
        <circle cx="50" cy="54" r="32" fill="#fffafd"/>
        <!-- Blush -->
        <ellipse cx="32" cy="62" rx="7" ry="4" fill="#f48fb1" opacity="0.65"/>
        <ellipse cx="68" cy="62" rx="7" ry="4" fill="#f48fb1" opacity="0.65"/>
        <!-- Eyes (Happy arch) -->
        <path d="M33 50 Q38 44 43 50" stroke="#4a154b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M57 50 Q62 44 67 50" stroke="#4a154b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <!-- Big open smile -->
        <path d="M43 60 Q50 71 57 60 Z" fill="#ff4081"/>
        <!-- Sparkle -->
        <circle cx="50" cy="30" r="3" fill="#ffd166"/>
      </svg>`,
    },
  ];

  const SWITCH_EVERY = 3; // Questions before automatic switch to a new Teenieping

  class TeeniepingManager {
    constructor() {
      this.list = TEENIEPINGS;
      this.currentIndex = 0;
      this.questionsSolved = 0;
      this.listeners = new Set();
    }

    getLeader() {
      return this.list[this.currentIndex];
    }

    // Switch to a new random Teenieping (guaranteed different from current).
    switchLeader(targetId = null) {
      const prev = this.getLeader();
      if (targetId) {
        const found = this.list.findIndex((t) => t.id === targetId);
        if (found !== -1) this.currentIndex = found;
      } else {
        const others = this.list.map((_, i) => i).filter((i) => i !== this.currentIndex);
        this.currentIndex = others[Math.floor(Math.random() * others.length)];
      }
      this.questionsSolved = 0;
      const next = this.getLeader();
      this.emit('switch', { prev, next });
      return next;
    }

    // Step question counter. Returns true if a switch just happened.
    stepQuestion() {
      this.questionsSolved++;
      if (this.questionsSolved >= SWITCH_EVERY) {
        this.switchLeader();
        return true;
      }
      this.emit('step', { leader: this.getLeader(), count: this.questionsSolved });
      return false;
    }

    cheer() {
      const L = this.getLeader();
      return L.cheers[Math.floor(Math.random() * L.cheers.length)];
    }

    hint() {
      const L = this.getLeader();
      return L.hints[Math.floor(Math.random() * L.hints.length)];
    }

    onChange(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    emit(event, data) {
      for (const fn of this.listeners) {
        try { fn(event, data); } catch (e) { console.error(e); }
      }
    }
  }

  const manager = new TeeniepingManager();

  const api = {
    TEENIEPINGS,
    SWITCH_EVERY,
    manager,
    getLeader: () => manager.getLeader(),
    switchLeader: (id) => manager.switchLeader(id),
    stepQuestion: () => manager.stepQuestion(),
    cheer: () => manager.cheer(),
    hint: () => manager.hint(),
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Teenieping = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
