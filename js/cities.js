/* Teenieping City Hero Engine
   Extensible city exploration system where Teenieping characters explore world cities,
   discover places of interest, buy famous local foods, and collect souvenirs
   by resolving math and reading puzzles.
   Compatible with browser (window.CityHeroEngine) and Node.js (module.exports). */
(function (root) {
  'use strict';

  // 4 Initial World Cities with rich landmarks, foods, culture, and souvenirs
  const DEFAULT_CITIES = [
    {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japan',
      flag: '🇯🇵',
      icon: '🗼',
      themeColor: '#f43f5e',
      skyGradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #f43f5e 100%)',
      heroMissionTitle: 'Tokyo Hero Adventure',
      greeting: 'Konnichiwa! Welcome to Tokyo! Let’s explore the bustling metropolis, chuping! 🗼',
      currency: 'Yen 🪙',
      stops: [
        {
          id: 'tokyo-tower',
          type: 'landmark',
          categoryLabel: '📍 Place of Interest',
          title: 'Tokyo Tower & Skywalk',
          icon: '🗼',
          bannerBg: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
          fact: 'Tokyo Tower is a world-famous red and white tower that sparkles with golden lights across the city at night!',
          puzzleType: 'reading',
          readingPassage: 'Tokyo Tower is very tall and red. Look up to see the bright stars in the sky.',
          missingWord: 'red',
          readingChoices: ['red', 'blue', 'tiny', 'cold'],
          speechPrompt: 'Read the story and find the missing color word for Tokyo Tower!',
          reward: {
            id: 'tokyo-badge-tower',
            name: 'Tokyo Tower Model',
            icon: '🗼',
            type: 'landmark',
            desc: 'A sparkling red mini-tower for your Hero Scrapbook!',
          },
        },
        {
          id: 'tokyo-food',
          type: 'food',
          categoryLabel: '🍜 Famous Local Food',
          title: 'Asakusa Ramen & Sushi Stand',
          icon: '🍜',
          bannerBg: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          fact: 'Warm ramen noodle soup with rich broth and fresh sushi rolls are beloved treats enjoyed across Tokyo!',
          puzzleType: 'math',
          mathStory: 'A bowl of warm ramen costs 5 coins and green tea costs 3 coins. How much in total?',
          mathA: 5,
          mathOp: '+',
          mathB: 3,
          mathAnswer: 8,
          speechPrompt: 'Calculate the total coins to buy the steaming ramen bowl!',
          reward: {
            id: 'tokyo-food-ramen',
            name: 'Steaming Tonkotsu Ramen',
            icon: '🍜',
            type: 'food',
            desc: 'A delicious bowl of warm noodles with seasoned egg and nori!',
          },
        },
        {
          id: 'tokyo-culture',
          type: 'culture',
          categoryLabel: '🌸 Cultural Wonder',
          title: 'Senso-ji Temple & Cherry Blossoms',
          icon: '⛩️',
          bannerBg: 'linear-gradient(135deg, #ec4899, #a855f7)',
          fact: 'Senso-ji is Tokyo’s oldest temple, where cherry blossom petals flutter gently in the spring breeze!',
          puzzleType: 'reading',
          readingPassage: 'Pink cherry blossom petals fall like soft snow. The friendly garden has many sweet flowers.',
          missingWord: 'flowers',
          readingChoices: ['flowers', 'rockets', 'stones', 'pencils'],
          speechPrompt: 'Read about the temple garden and choose the word that fits!',
          reward: {
            id: 'tokyo-badge-sakura',
            name: 'Cherry Blossom Charm',
            icon: '🌸',
            type: 'culture',
            desc: 'A fragrant pink sakura blossom preserved in crystal glass!',
          },
        },
        {
          id: 'tokyo-souvenir',
          type: 'souvenir',
          categoryLabel: '🎁 Famous Souvenir',
          title: 'Nakamise Craft & Daruma Shop',
          icon: '🎎',
          bannerBg: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          fact: 'Traditional red Daruma dolls bring good fortune, courage, and perseverance to everyone who makes a wish!',
          puzzleType: 'math',
          mathStory: 'The lucky Daruma doll costs 9 coins. You give the shopkeeper 10 coins. How many coins do you get back?',
          mathA: 10,
          mathOp: '-',
          mathB: 9,
          mathAnswer: 1,
          speechPrompt: 'Calculate your change to bring home the lucky Daruma doll!',
          reward: {
            id: 'tokyo-souvenir-daruma',
            name: 'Lucky Red Daruma Doll',
            icon: '🎎',
            type: 'souvenir',
            desc: 'A traditional Japanese wishing doll for courage and good grades!',
          },
        },
      ],
    },
    {
      id: 'washington-dc',
      name: 'Washington D.C.',
      country: 'USA',
      flag: '🇺🇸',
      icon: '🏛️',
      themeColor: '#3b82f6',
      skyGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
      heroMissionTitle: 'Capitol City Hero Mission',
      greeting: 'Hello from Washington D.C.! Let’s explore the capital city and historical monuments, dada! 🏛️',
      currency: 'Dollars 💵',
      stops: [
        {
          id: 'dc-monument',
          type: 'landmark',
          categoryLabel: '📍 Place of Interest',
          title: 'The National Mall & Monument',
          icon: '🏛️',
          bannerBg: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
          fact: 'The towering Washington Monument stands over 550 feet tall, reflected in the calm waters of the Lincoln pool!',
          puzzleType: 'reading',
          readingPassage: 'The grand white monument stands tall in the green park. Flags wave proudly in the wind.',
          missingWord: 'park',
          readingChoices: ['park', 'cave', 'swamp', 'ocean'],
          speechPrompt: 'Read the passage and select the word that completes the sentence!',
          reward: {
            id: 'dc-badge-monument',
            name: 'Capitol Dome Medal',
            icon: '🏛️',
            type: 'landmark',
            desc: 'A shiny silver medal honoring the historic National Mall monuments!',
          },
        },
        {
          id: 'dc-food',
          type: 'food',
          categoryLabel: '🌭 Famous Local Food',
          title: 'Ben’s Chili Bowl Half-Smoke',
          icon: '🌭',
          bannerBg: 'linear-gradient(135deg, #f97316, #ef4444)',
          fact: 'The legendary Half-Smoke is a grilled smoked sausage topped with spicy chili, herbs, and sweet onions!',
          puzzleType: 'math',
          mathStory: 'You buy 1 Half-Smoke for 6 dollars and a fruit juice for 4 dollars. What is the total?',
          mathA: 6,
          mathOp: '+',
          mathB: 4,
          mathAnswer: 10,
          speechPrompt: 'Add the snack prices to enjoy D.C.’s famous street food treat!',
          reward: {
            id: 'dc-food-halfsmoke',
            name: 'Grilled D.C. Half-Smoke',
            icon: '🌭',
            type: 'food',
            desc: 'A sizzling D.C. classic sausage loaded with warm chili and onions!',
          },
        },
        {
          id: 'dc-culture',
          type: 'culture',
          categoryLabel: '🚀 Cultural Wonder',
          title: 'Air & Space Museum & National Zoo',
          icon: '🚀',
          bannerBg: 'linear-gradient(135deg, #6366f1, #a855f7)',
          fact: 'Explore real Apollo spacecraft, airplanes, and see giant pandas enjoying fresh bamboo at the National Zoo!',
          puzzleType: 'reading',
          readingPassage: 'A shiny silver rocket flew all the way to the moon. Brave pilots fly fast through the blue sky.',
          missingWord: 'sky',
          readingChoices: ['sky', 'mud', 'carpet', 'box'],
          speechPrompt: 'Read about the space rockets and pick the missing word!',
          reward: {
            id: 'dc-badge-space',
            name: 'Apollo Moon Rocket Pin',
            icon: '🚀',
            type: 'culture',
            desc: 'An official astronaut flight badge from the Air and Space Museum!',
          },
        },
        {
          id: 'dc-souvenir',
          type: 'souvenir',
          categoryLabel: '🎁 Famous Souvenir',
          title: 'Smithsonian Gift & Keepsake Shop',
          icon: '🔮',
          bannerBg: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          fact: 'Children love collecting White House snow globes and astronaut freeze-dried strawberry ice cream bars!',
          puzzleType: 'math',
          mathStory: 'The White House snow globe costs 8 dollars. You pay with 12 dollars. How much change do you receive?',
          mathA: 12,
          mathOp: '-',
          mathB: 8,
          mathAnswer: 4,
          speechPrompt: 'Calculate your change to collect the White House snow globe!',
          reward: {
            id: 'dc-souvenir-globe',
            name: 'White House Snow Globe',
            icon: '🔮',
            type: 'souvenir',
            desc: 'A magical crystal snow globe with floating sparkles over the White House!',
          },
        },
      ],
    },
    {
      id: 'beijing',
      name: 'Beijing',
      country: 'China',
      flag: '🇨🇳',
      icon: '🏯',
      themeColor: '#e11d48',
      skyGradient: 'linear-gradient(135deg, #18181b 0%, #881337 50%, #e11d48 100%)',
      heroMissionTitle: 'Imperial Capital Hero Journey',
      greeting: 'Ni hao! Welcome to historic Beijing! Let’s discover ancient palaces and taste royal treats, gogo! 🏯',
      currency: 'Yuan 🪙',
      stops: [
        {
          id: 'beijing-wall',
          type: 'landmark',
          categoryLabel: '📍 Place of Interest',
          title: 'The Great Wall of China',
          icon: '🏯',
          bannerBg: 'linear-gradient(135deg, #f43f5e, #fb7185)',
          fact: 'The majestic Great Wall winds across mountain ridges for thousands of miles, built with stone watchtowers!',
          puzzleType: 'reading',
          readingPassage: 'The grand stone wall climbs high up the green mountains. Watchtowers stand strong and guard the city.',
          missingWord: 'strong',
          readingChoices: ['strong', 'asleep', 'wet', 'small'],
          speechPrompt: 'Read about the Great Wall and choose the word that describes the towers!',
          reward: {
            id: 'beijing-badge-wall',
            name: 'Great Wall Golden Stone',
            icon: '🏯',
            type: 'landmark',
            desc: 'A commemorative carved stone brick from the Badaling Great Wall!',
          },
        },
        {
          id: 'beijing-food',
          type: 'food',
          categoryLabel: '🦆 Famous Local Food',
          title: 'Peking Roast Duck & Sweet Tanghulu',
          icon: '🦆',
          bannerBg: 'linear-gradient(135deg, #ea580c, #f59e0b)',
          fact: 'Crispy roasted duck wrapped in delicate pancakes, followed by candied hawthorn berries on a stick (Tanghulu)!',
          puzzleType: 'math',
          mathStory: 'A plate of crispy duck pancakes is 7 coins and sweet Tanghulu is 5 coins. What is the total?',
          mathA: 7,
          mathOp: '+',
          mathB: 5,
          mathAnswer: 12,
          speechPrompt: 'Add the coins to order the famous crispy Peking duck banquet!',
          reward: {
            id: 'beijing-food-duck',
            name: 'Crispy Peking Duck Pancakes',
            icon: '🦆',
            type: 'food',
            desc: 'Golden roasted duck slices with sweet bean sauce and fresh scallions!',
          },
        },
        {
          id: 'beijing-culture',
          type: 'culture',
          categoryLabel: '🏮 Cultural Wonder',
          title: 'The Forbidden City & Temple of Heaven',
          icon: '🏮',
          bannerBg: 'linear-gradient(135deg, #b91c1c, #dc2626)',
          fact: 'With yellow-glazed rooftops and red lacquer columns, the Forbidden City holds nearly 1,000 palace buildings!',
          puzzleType: 'reading',
          readingPassage: 'Golden dragon carvings shine in the palace halls. Red lanterns glow brightly in the courtyard.',
          missingWord: 'brightly',
          readingChoices: ['brightly', 'sadly', 'darkly', 'coldly'],
          speechPrompt: 'Read about the royal palace and choose the word that fits!',
          reward: {
            id: 'beijing-badge-dragon',
            name: 'Imperial Dragon Seal',
            icon: '🏮',
            type: 'culture',
            desc: 'A regal jade-green dragon seal engraved with peace and happiness symbols!',
          },
        },
        {
          id: 'beijing-souvenir',
          type: 'souvenir',
          categoryLabel: '🎁 Famous Souvenir',
          title: 'Cloisonné Enamel & Panda Bazaar',
          icon: '🐼',
          bannerBg: 'linear-gradient(135deg, #10b981, #059669)',
          fact: 'Cloisonné is intricate copper wirework filled with vibrant colored enamel, celebrated alongside cute Panda plushies!',
          puzzleType: 'math',
          mathStory: 'The fluffy Panda plush costs 9 coins. You pay with a 15-coin bill. How many coins of change do you get?',
          mathA: 15,
          mathOp: '-',
          mathB: 9,
          mathAnswer: 6,
          speechPrompt: 'Calculate your change to adopt the adorable Beijing Panda plush!',
          reward: {
            id: 'beijing-souvenir-panda',
            name: 'Fluffy Bamboo Panda Plush',
            icon: '🐼',
            type: 'souvenir',
            desc: 'An ultra-soft plush panda holding a lucky green bamboo leaf!',
          },
        },
      ],
    },
    {
      id: 'shanghai',
      name: 'Shanghai',
      country: 'China',
      flag: '🇨🇳',
      icon: '🏙️',
      themeColor: '#06b6d4',
      skyGradient: 'linear-gradient(135deg, #090d16 0%, #155e75 50%, #06b6d4 100%)',
      heroMissionTitle: 'Shanghai Skyline Hero Quest',
      greeting: 'Welcome to dazzling Shanghai! Let’s stroll along the Bund and taste warm soup dumplings, lala! 🏙️',
      currency: 'Yuan 🪙',
      stops: [
        {
          id: 'shanghai-bund',
          type: 'landmark',
          categoryLabel: '📍 Place of Interest',
          title: 'The Bund & Oriental Pearl Tower',
          icon: '🏙️',
          bannerBg: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          fact: 'The Bund waterfront faces futuristic skyscrapers like the Oriental Pearl Tower with glowing sphere domes!',
          puzzleType: 'reading',
          readingPassage: 'Tall glass skyscrapers light up the night by the river. Boats sail smoothly across the shining water.',
          missingWord: 'water',
          readingChoices: ['water', 'forest', 'desert', 'clouds'],
          speechPrompt: 'Read about the riverfront skyline and choose the word that completes the sentence!',
          reward: {
            id: 'shanghai-badge-pearl',
            name: 'Pearl Tower Crystal Prism',
            icon: '🏙️',
            type: 'landmark',
            desc: 'A glowing glass model of the Oriental Pearl Tower reflecting rainbow colors!',
          },
        },
        {
          id: 'shanghai-food',
          type: 'food',
          categoryLabel: '🥟 Famous Local Food',
          title: 'Nanxiang Xiaolongbao Tea House',
          icon: '🥟',
          bannerBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          fact: 'Xiaolongbao are delicate steamed buns filled with savoury filling and rich hot broth inside thin dough wrappers!',
          puzzleType: 'math',
          mathStory: 'One bamboo steamer has 4 dumplings. You order 2 steamers. How many dumplings are there in all?',
          mathA: 4,
          mathOp: '+',
          mathB: 4,
          mathAnswer: 8,
          speechPrompt: 'Add the dumplings across both steaming bamboo baskets!',
          reward: {
            id: 'shanghai-food-bao',
            name: 'Steaming Xiaolongbao Basket',
            icon: '🥟',
            type: 'food',
            desc: 'A hot bamboo steamer filled with fresh soup dumplings!',
          },
        },
        {
          id: 'shanghai-culture',
          type: 'culture',
          categoryLabel: '🎋 Cultural Wonder',
          title: 'Yu Garden & Nine-Turn Bridge',
          icon: '🎋',
          bannerBg: 'linear-gradient(135deg, #10b981, #14b8a6)',
          fact: 'Built during the Ming Dynasty, Yu Garden features peaceful koi ponds, zig-zag bridges, and ancient pine bonsai trees!',
          puzzleType: 'reading',
          readingPassage: 'Colorful orange koi fish swim gently in the quiet pond. Green trees grow along the lovely stone path.',
          missingWord: 'path',
          readingChoices: ['path', 'bed', 'closet', 'stove'],
          speechPrompt: 'Read about the traditional Chinese garden and choose the missing word!',
          reward: {
            id: 'shanghai-badge-koi',
            name: 'Lucky Golden Koi Medallion',
            icon: '🎋',
            type: 'culture',
            desc: 'A lucky carved jade medal featuring twin koi fish swimming in harmony!',
          },
        },
        {
          id: 'shanghai-souvenir',
          type: 'souvenir',
          categoryLabel: '🎁 Famous Souvenir',
          title: 'Old Town Silk Fan & Qipao Market',
          icon: '🪭',
          bannerBg: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          fact: 'Hand-painted silk folding fans decorated with delicate calligraphy and mountain watercolors are Shanghai treasures!',
          puzzleType: 'math',
          mathStory: 'The silk fan costs 7 coins and a silk bookmark costs 4 coins. How much are both souvenirs together?',
          mathA: 7,
          mathOp: '+',
          mathB: 4,
          mathAnswer: 11,
          speechPrompt: 'Calculate the total coins to buy the hand-painted silk fan and bookmark!',
          reward: {
            id: 'shanghai-souvenir-fan',
            name: 'Hand-Painted Silk Fan',
            icon: '🪭',
            type: 'souvenir',
            desc: 'A delicate silk folding fan painted with blossoms and poetic calligraphy!',
          },
        },
      ],
    },
  ];

  // In-memory / dynamic registry to allow adding more cities
  const cityRegistry = new Map();

  function registerCity(cityConfig) {
    if (!cityConfig || !cityConfig.id || !cityConfig.name || !Array.isArray(cityConfig.stops)) {
      throw new Error('Invalid city configuration: must have id, name, and stops array.');
    }
    cityRegistry.set(cityConfig.id, { ...cityConfig });
    return cityConfig;
  }

  // Initialize with the 4 default cities
  DEFAULT_CITIES.forEach((c) => registerCity(c));

  function getCities() {
    return Array.from(cityRegistry.values());
  }

  function getCity(cityId) {
    return cityRegistry.get(cityId) || null;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Generates a tailored puzzle for a given city stop
  function makeStopPuzzle(city, stop) {
    if (stop.puzzleType === 'reading') {
      const passage = stop.readingPassage;
      const target = stop.missingWord;
      const rawChoices = stop.readingChoices || [target, 'big', 'happy', 'cold'];
      const choices = shuffle(rawChoices).map((word) => ({
        text: word,
        isCorrect: word.toLowerCase() === target.toLowerCase(),
      }));

      // Find text up to missing word for host reading
      const targetMatch = passage.match(new RegExp(`\\b${target}\\b`, 'i'));
      const textUpToBlank = targetMatch ? passage.slice(0, targetMatch.index).trim() : passage;

      // Create cloze prompt with blank
      const promptText = passage.replace(new RegExp(`\\b${target}\\b`, 'i'), '______');

      return {
        type: 'reading',
        category: 'reading',
        headline: `${city.flag} ${stop.title}`,
        prompt: promptText,
        speechText: textUpToBlank,
        choices,
        correctWord: target,
        reward: stop.reward,
        fact: stop.fact,
      };
    }

    // Math puzzle
    const a = stop.mathA;
    const b = stop.mathB;
    const op = stop.mathOp || '+';
    const answer = stop.mathAnswer;
    const opSymbol = op === '+' ? '+' : '−';

    const distractorSet = new Set([answer]);
    const offsets = [-2, -1, 1, 2, 3, -3];
    shuffle(offsets);
    for (const off of offsets) {
      const cand = answer + off;
      if (cand > 0 && !distractorSet.has(cand)) distractorSet.add(cand);
      if (distractorSet.size >= 4) break;
    }
    while (distractorSet.size < 4) {
      distractorSet.add(Math.max(1, answer + Math.floor(Math.random() * 6) - 3));
    }

    const choices = shuffle(Array.from(distractorSet)).map((val) => ({
      text: `${val} ${city.currency.split(' ')[0]}`,
      value: val,
      isCorrect: val === answer,
    }));

    return {
      type: 'math',
      category: 'math',
      headline: `${city.flag} ${stop.title}`,
      story: stop.mathStory,
      prompt: `${stop.mathStory}\n(${a} ${opSymbol} ${b} = ?)`,
      equation: `${a} ${opSymbol} ${b} = ?`,
      speechText: `${stop.speechPrompt} ${stop.mathStory}`,
      choices,
      correctAnswer: answer,
      reward: stop.reward,
      fact: stop.fact,
    };
  }

  // Generates rich SVG diorama scenes for each stop (with fallback for custom registered cities)
  function getStopSceneSvg(city, stop) {
    const id = stop?.id || '';
    const SCENE_MAP = {
      'tokyo-tower': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <defs><linearGradient id="tk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="65%" stop-color="#311042"/><stop offset="100%" stop-color="#831843"/></linearGradient></defs>
        <rect width="360" height="140" rx="14" fill="url(#tk1)"/>
        <circle cx="52" cy="28" r="14" fill="#fef08a" opacity="0.9"/>
        <circle cx="290" cy="24" r="2" fill="#fff"/><circle cx="120" cy="20" r="1.8" fill="#fff"/><circle cx="240" cy="36" r="2.2" fill="#fde047"/>
        <!-- City skyline -->
        <rect x="18" y="84" width="32" height="56" fill="#1e1b4b"/><rect x="56" y="72" width="28" height="68" fill="#1e293b"/>
        <rect x="92" y="90" width="38" height="50" fill="#1e1b4b"/><rect x="234" y="76" width="34" height="64" fill="#1e293b"/>
        <rect x="274" y="66" width="40" height="74" fill="#0f172a"/><rect x="318" y="88" width="28" height="52" fill="#1e1b4b"/>
        <!-- Lit skyscraper windows -->
        <g fill="#fde047" opacity="0.75"><rect x="62" y="80" width="4" height="5"/><rect x="72" y="80" width="4" height="5"/><rect x="62" y="92" width="4" height="5"/><rect x="282" y="76" width="5" height="5"/><rect x="294" y="76" width="5" height="5"/><rect x="282" y="90" width="5" height="5"/><rect x="294" y="104" width="5" height="5"/></g>
        <!-- Tokyo Tower lattice -->
        <polygon points="180,10 152,135 164,135 180,36 196,135 208,135" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
        <rect x="163" y="64" width="34" height="6" fill="#ffffff"/><rect x="156" y="98" width="48" height="8" rx="2" fill="#ffffff"/>
        <rect x="168" y="42" width="24" height="5" fill="#ffffff"/>
        <line x1="180" y1="2" x2="180" y2="12" stroke="#ffffff" stroke-width="3"/>
        <circle cx="180" cy="4" r="3.5" fill="#fde047"/>
      </svg>`,
      'tokyo-food': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#451a03"/>
        <rect x="0" y="0" width="360" height="32" fill="#7c2d12"/>
        <!-- Noren curtains -->
        <rect x="24" y="8" width="56" height="36" rx="4" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
        <rect x="90" y="8" width="56" height="36" rx="4" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
        <rect x="214" y="8" width="56" height="36" rx="4" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
        <rect x="280" y="8" width="56" height="36" rx="4" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
        <!-- Glowing Chochin Lanterns -->
        <ellipse cx="180" cy="30" rx="18" ry="22" fill="#ef4444" stroke="#fde047" stroke-width="2"/>
        <line x1="168" y1="12" x2="192" y2="12" stroke="#fde047" stroke-width="3"/><line x1="168" y1="48" x2="192" y2="48" stroke="#fde047" stroke-width="3"/>
        <!-- Wooden counter -->
        <rect x="0" y="106" width="360" height="34" fill="#b45309"/><line x1="0" y1="106" x2="360" y2="106" stroke="#fcd34d" stroke-width="3"/>
        <!-- Steaming Ramen Bowl -->
        <path d="M126 84 Q180 128 234 84 Z" fill="#dc2626" stroke="#fef08a" stroke-width="2.5"/>
        <ellipse cx="180" cy="84" rx="54" ry="12" fill="#fef3c7" stroke="#dc2626" stroke-width="2"/>
        <ellipse cx="162" cy="84" rx="12" ry="7" fill="#fff"/><circle cx="162" cy="84" r="4.5" fill="#f97316"/>
        <rect x="194" y="74" width="16" height="14" rx="2" fill="#064e3b" transform="rotate(12 194 74)"/>
        <!-- Chopsticks & Steam -->
        <line x1="190" y1="62" x2="250" y2="48" stroke="#fde68a" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M155 68 Q150 56 158 46" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.7" stroke-linecap="round"/>
        <path d="M180 65 Q175 52 183 42" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.7" stroke-linecap="round"/>
      </svg>`,
      'tokyo-culture': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <defs><linearGradient id="tk3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#831843"/><stop offset="100%" stop-color="#db2777"/></linearGradient></defs>
        <rect width="360" height="140" rx="14" fill="url(#tk3)"/>
        <circle cx="300" cy="36" r="24" fill="#fbcfe8" opacity="0.4"/>
        <!-- Senso-ji Torii / Temple Gate -->
        <path d="M108 38 Q180 24 252 38 L244 48 Q180 36 116 48 Z" fill="#1e293b"/>
        <rect x="122" y="54" width="116" height="8" fill="#ef4444"/>
        <rect x="134" y="44" width="12" height="92" fill="#dc2626"/><rect x="214" y="44" width="12" height="92" fill="#dc2626"/>
        <ellipse cx="180" cy="68" rx="14" ry="18" fill="#ef4444" stroke="#fde047" stroke-width="2"/>
        <!-- Cherry Blossom Branches & Petals -->
        <circle cx="48" cy="36" r="28" fill="#f9a8d4" opacity="0.85"/><circle cx="78" cy="24" r="22" fill="#fbcfe8" opacity="0.9"/>
        <circle cx="312" cy="42" r="26" fill="#f9a8d4" opacity="0.85"/><circle cx="284" cy="22" r="20" fill="#fbcfe8" opacity="0.9"/>
        <g fill="#fce7f3"><circle cx="96" cy="70" r="4"/><circle cx="114" cy="92" r="3.5"/><circle cx="262" cy="78" r="4"/><circle cx="240" cy="105" r="3"/></g>
      </svg>`,
      'tokyo-souvenir': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#311042"/>
        <rect x="20" y="104" width="320" height="24" rx="6" fill="#78350f"/>
        <!-- Lucky Daruma Dolls on shelf -->
        <ellipse cx="180" cy="74" rx="34" ry="36" fill="#dc2626" stroke="#fde047" stroke-width="2.5"/>
        <ellipse cx="180" cy="64" rx="22" ry="16" fill="#fef3c7"/>
        <circle cx="171" cy="64" r="6" fill="#fff" stroke="#111" stroke-width="2"/><circle cx="171" cy="64" r="3" fill="#111"/>
        <circle cx="189" cy="64" r="6" fill="#fff" stroke="#111" stroke-width="2"/><circle cx="189" cy="64" r="3" fill="#111"/>
        <path d="M168 88 L192 88 M172 95 L188 95" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
        <!-- Mini companion Darumas -->
        <ellipse cx="96" cy="84" rx="22" ry="24" fill="#f43f5e" stroke="#fde047" stroke-width="1.5"/>
        <ellipse cx="264" cy="84" rx="22" ry="24" fill="#f59e0b" stroke="#fef08a" stroke-width="1.5"/>
      </svg>`,
      'dc-monument': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <defs><linearGradient id="dc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1d4ed8"/><stop offset="70%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#bbf7d0"/></linearGradient></defs>
        <rect width="360" height="140" rx="14" fill="url(#dc1)"/>
        <rect x="0" y="102" width="360" height="38" fill="#15803d"/>
        <!-- Reflecting Pool -->
        <polygon points="130,140 162,102 198,102 230,140" fill="#38bdf8" opacity="0.85"/>
        <!-- Washington Monument Obelisk -->
        <polygon points="180,10 170,26 190,26" fill="#f8fafc"/>
        <polygon points="170,26 190,26 194,102 166,102" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <!-- Capitol Dome silhouette in distance -->
        <path d="M56 102 L56 84 L96 84 L96 102 Z" fill="#e2e8f0"/>
        <path d="M64 84 Q76 62 88 84 Z" fill="#f8fafc"/>
        <!-- Trees along National Mall -->
        <circle cx="122" cy="96" r="14" fill="#166534"/><circle cx="144" cy="96" r="12" fill="#15803d"/>
        <circle cx="238" cy="96" r="14" fill="#166534"/><circle cx="216" cy="96" r="12" fill="#15803d"/>
      </svg>`,
      'dc-food': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#7c2d12"/>
        <rect x="0" y="0" width="360" height="28" fill="#dc2626"/>
        <rect x="0" y="104" width="360" height="36" fill="#fde68a"/>
        <!-- Ben's Chili Bowl Sign & Plate -->
        <ellipse cx="180" cy="94" rx="78" ry="22" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Half-Smoke bun & sausage -->
        <rect x="122" y="70" width="116" height="32" rx="16" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
        <rect x="114" y="76" width="132" height="16" rx="8" fill="#991b1b"/>
        <!-- Chili & Mustard wave -->
        <path d="M126 84 Q140 76 154 84 T182 84 T210 84 T234 84" stroke="#fde047" stroke-width="4" fill="none" stroke-linecap="round"/>
      </svg>`,
      'dc-culture': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#0f172a"/>
        <circle cx="64" cy="36" r="18" fill="#38bdf8" opacity="0.3"/><circle cx="290" cy="40" r="26" fill="#a855f7" opacity="0.25"/>
        <circle cx="95" cy="24" r="2" fill="#fff"/><circle cx="250" cy="22" r="2" fill="#fde047"/><circle cx="318" cy="78" r="2" fill="#fff"/>
        <!-- Apollo Rocket in Air & Space Hangar -->
        <polygon points="180,10 166,38 194,38" fill="#ef4444"/>
        <rect x="166" y="38" width="28" height="62" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="166" y="56" width="28" height="12" fill="#1e293b"/>
        <polygon points="166,82 148,106 166,100" fill="#ef4444"/><polygon points="194,82 212,106 194,100" fill="#ef4444"/>
        <circle cx="180" cy="48" r="6" fill="#38bdf8" stroke="#1e293b" stroke-width="2"/>
        <polygon points="170,100 180,132 190,100" fill="#f59e0b"/>
      </svg>`,
      'dc-souvenir': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#1e3a8a"/>
        <!-- Snow Globe -->
        <path d="M136 106 L224 106 L234 128 L126 128 Z" fill="#78350f" stroke="#fde047" stroke-width="2"/>
        <circle cx="180" cy="66" r="46" fill="#38bdf8" opacity="0.35" stroke="#e0f2fe" stroke-width="3"/>
        <!-- Mini White House inside globe -->
        <rect x="152" y="68" width="56" height="28" fill="#ffffff"/>
        <polygon points="180,50 158,68 202,68" fill="#f1f5f9"/>
        <g stroke="#cbd5e1" stroke-width="2"><line x1="164" y1="68" x2="164" y2="96"/><line x1="174" y1="68" x2="174" y2="96"/><line x1="186" y1="68" x2="186" y2="96"/><line x1="196" y1="68" x2="196" y2="96"/></g>
        <!-- Sparkle snow -->
        <g fill="#ffffff"><circle cx="156" cy="44" r="2.5"/><circle cx="184" cy="36" r="2"/><circle cx="204" cy="48" r="2.5"/><circle cx="148" cy="62" r="2"/></g>
      </svg>`,
      'beijing-wall': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <defs><linearGradient id="bj1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#881337"/><stop offset="60%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#fde047"/></linearGradient></defs>
        <rect width="360" height="140" rx="14" fill="url(#bj1)"/>
        <!-- Mountain peaks -->
        <polygon points="0,140 68,54 150,140" fill="#065f46"/><polygon points="100,140 195,46 290,140" fill="#047857"/><polygon points="220,140 310,58 360,140" fill="#065f46"/>
        <!-- Great Wall winding battlements -->
        <path d="M20 118 Q105 68 185 88 T340 64" stroke="#d6d3d1" stroke-width="14" fill="none"/>
        <path d="M20 118 Q105 68 185 88 T340 64" stroke="#78716c" stroke-width="10" stroke-dasharray="8 6" fill="none"/>
        <!-- Watchtower -->
        <rect x="164" y="48" width="36" height="34" fill="#a8a29e" stroke="#57534e" stroke-width="2"/>
        <polygon points="158,48 182,32 206,48" fill="#b91c1c"/>
      </svg>`,
      'beijing-food': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#7f1d1d"/>
        <ellipse cx="150" cy="88" rx="64" ry="26" fill="#fef3c7" stroke="#f59e0b" stroke-width="3"/>
        <!-- Golden Roast Duck -->
        <ellipse cx="150" cy="80" rx="44" ry="20" fill="#d97706" stroke="#92400e" stroke-width="2"/>
        <!-- Tanghulu candied hawthorn skewers -->
        <line x1="250" y1="118" x2="292" y2="26" stroke="#fde68a" stroke-width="3.5"/>
        <circle cx="286" cy="38" r="10" fill="#ef4444"/><circle cx="277" cy="56" r="10" fill="#ef4444"/><circle cx="268" cy="74" r="10" fill="#ef4444"/><circle cx="259" cy="92" r="10" fill="#ef4444"/>
      </svg>`,
      'beijing-culture': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#450a0a"/>
        <!-- Forbidden City Imperial Golden Roof -->
        <polygon points="86,62 180,26 274,62" fill="#f59e0b" stroke="#fef08a" stroke-width="2"/>
        <polygon points="68,84 180,52 292,84" fill="#fbbf24" stroke="#fef08a" stroke-width="2"/>
        <rect x="96" y="84" width="168" height="48" fill="#b91c1c"/>
        <g stroke="#fde047" stroke-width="3"><line x1="124" y1="84" x2="124" y2="132"/><line x1="156" y1="84" x2="156" y2="132"/><line x1="204" y1="84" x2="204" y2="132"/><line x1="236" y1="84" x2="236" y2="132"/></g>
        <path d="M168 132 L168 104 Q180 94 192 104 L192 132 Z" fill="#78350f" stroke="#fde047" stroke-width="1.5"/>
      </svg>`,
      'beijing-souvenir': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#064e3b"/>
        <!-- Bamboo stalks -->
        <g stroke="#34d399" stroke-width="6"><line x1="48" y1="10" x2="48" y2="130"/><line x1="312" y1="10" x2="312" y2="130"/></g>
        <!-- Cute Panda Plush -->
        <circle cx="156" cy="40" r="12" fill="#111"/><circle cx="204" cy="40" r="12" fill="#111"/>
        <circle cx="180" cy="68" r="32" fill="#ffffff" stroke="#111" stroke-width="2"/>
        <ellipse cx="168" cy="64" rx="8" ry="10" fill="#111"/><ellipse cx="192" cy="64" rx="8" ry="10" fill="#111"/>
        <circle cx="169" cy="62" r="3" fill="#fff"/><circle cx="191" cy="62" r="3" fill="#fff"/>
        <ellipse cx="180" cy="74" rx="5" ry="3.5" fill="#111"/>
      </svg>`,
      'shanghai-bund': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <defs><linearGradient id="sh1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#090d16"/><stop offset="70%" stop-color="#0e7490"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
        <rect width="360" height="140" rx="14" fill="url(#sh1)"/>
        <rect x="0" y="108" width="360" height="32" fill="#083344"/>
        <!-- Pudong Skyscrapers -->
        <rect x="70" y="54" width="28" height="54" fill="#164e63"/><rect x="230" y="42" width="32" height="66" fill="#155e75"/>
        <polygon points="280,32 304,32 308,108 276,108" fill="#0ea5e9" opacity="0.7"/>
        <!-- Oriental Pearl Tower -->
        <line x1="172" y1="82" x2="158" y2="108" stroke="#f472b6" stroke-width="4"/><line x1="188" y1="82" x2="202" y2="108" stroke="#f472b6" stroke-width="4"/>
        <rect x="176" y="20" width="8" height="88" fill="#cbd5e1"/>
        <circle cx="180" cy="76" r="16" fill="#ec4899" stroke="#fbcfe8" stroke-width="2"/>
        <circle cx="180" cy="40" r="11" fill="#ec4899" stroke="#fbcfe8" stroke-width="2"/>
        <line x1="180" y1="4" x2="180" y2="26" stroke="#f472b6" stroke-width="3"/>
      </svg>`,
      'shanghai-food': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#78350f"/>
        <!-- Bamboo Steamer Basket -->
        <ellipse cx="180" cy="96" rx="70" ry="26" fill="#d97706" stroke="#fde68a" stroke-width="3"/>
        <ellipse cx="180" cy="84" rx="66" ry="22" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
        <!-- Xiaolongbao Soup Dumplings -->
        <circle cx="158" cy="80" r="13" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="186" cy="74" r="13" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="204" cy="86" r="13" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="174" cy="90" r="13" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      </svg>`,
      'shanghai-culture': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#064e3b"/>
        <!-- Jade Koi Pond -->
        <ellipse cx="180" cy="96" rx="140" ry="34" fill="#0d9488"/>
        <!-- Nine-Turn Bridge -->
        <polyline points="40,98 110,78 175,96 245,76 320,94" fill="none" stroke="#f8fafc" stroke-width="10" stroke-linejoin="round"/>
        <polyline points="40,98 110,78 175,96 245,76 320,94" fill="none" stroke="#ef4444" stroke-width="4" stroke-linejoin="round"/>
        <!-- Orange Koi Fish -->
        <ellipse cx="136" cy="112" rx="12" ry="5" fill="#f97316"/><ellipse cx="226" cy="108" rx="12" ry="5" fill="#fb923c"/>
      </svg>`,
      'shanghai-souvenir': `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
        <rect width="360" height="140" rx="14" fill="#4c1d95"/>
        <!-- Hand-Painted Folding Silk Fan -->
        <path d="M180 116 L96 44 Q180 4 264 44 Z" fill="#fdf2f8" stroke="#f472b6" stroke-width="3"/>
        <g stroke="#d97706" stroke-width="2"><line x1="180" y1="116" x2="118" y2="34"/><line x1="180" y1="116" x2="148" y2="26"/><line x1="180" y1="116" x2="180" y2="22"/><line x1="180" y1="116" x2="212" y2="26"/><line x1="180" y1="116" x2="242" y2="34"/></g>
        <circle cx="164" cy="54" r="8" fill="#f43f5e" opacity="0.8"/><circle cx="198" cy="48" r="6" fill="#ec4899" opacity="0.8"/>
      </svg>`,
    };

    if (SCENE_MAP[id]) return SCENE_MAP[id];

    // Dynamic fallback diorama for custom registered cities
    const accent = city?.themeColor || '#3b82f6';
    return `<svg viewBox="0 0 360 140" class="city-diorama-svg" aria-hidden="true">
      <rect width="360" height="140" rx="14" fill="#0f172a"/>
      <circle cx="60" cy="36" r="24" fill="${accent}" opacity="0.35"/>
      <circle cx="290" cy="95" r="36" fill="${accent}" opacity="0.25"/>
      <text x="180" y="86" text-anchor="middle" font-size="54">${stop?.icon || city?.icon || '🌍'}</text>
    </svg>`;
  }

  function getCityFlightMeta(city) {
    const metaMap = {
      tokyo: { airport: 'HND • Haneda Intl', flightNo: 'TP-108', localTime: '19:30 JST', weather: '🌙 18°C Starry Night', gate: 'G7' },
      'washington-dc': { airport: 'DCA • Reagan National', flightNo: 'TP-204', localTime: '10:30 EDT', weather: '⛅ 22°C Capitol Breeze', gate: 'A4' },
      beijing: { airport: 'PEK • Beijing Capital', flightNo: 'TP-309', localTime: '18:30 CST', weather: '🏮 20°C Golden Dusk', gate: 'B2' },
      shanghai: { airport: 'PVG • Pudong Intl', flightNo: 'TP-512', localTime: '19:00 CST', weather: '✨ 21°C Bund Lights', gate: 'C9' },
    };
    return metaMap[city?.id] || {
      airport: `${(city?.id || 'INT').slice(0, 3).toUpperCase()} • World Airport`,
      flightNo: 'TP-777',
      localTime: '14:00 LOC',
      weather: '☀️ 21°C Sunny',
      gate: 'D1',
    };
  }

  const api = {
    DEFAULT_CITIES,
    registerCity,
    getCities,
    getCity,
    makeStopPuzzle,
    getStopSceneSvg,
    getCityFlightMeta,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.CityHeroEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
