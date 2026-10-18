// ==================== TEENIEPING SWEET BAKERY ENGINE ====================
// Harmony Town Sweet Bakery & Cafe simulation:
// Combines existing MathEngine & Reading (WORD_LEVELS + recipe cloze) with a
// realistic 3-stage pastry kitchen (Batter Base -> Frosting Swirl -> Oven & Toppings)
// and live layered SVG dessert assembly.

(function (root) {
  const TARGET_ORDERS_FOR_VICTORY = 3;
  const STEPS_PER_ORDER = 3;

  const STEP_META = [
    {
      stepIndex: 0,
      id: 'base',
      badge: '🥣 STEP 1 • MIX & MEASURE BATTER',
      station: 'Digital Kitchen Scale • 250g Flour',
      ovenTemp: '180°F Preheat',
      actionVerb: 'Mixed golden sponge batter!',
    },
    {
      stepIndex: 1,
      id: 'frosting',
      badge: '🍦 STEP 2 • WHIP & PIPE FROSTING',
      station: 'Pastry Piping Bag • Sweet Cream',
      ovenTemp: '350°F Baking',
      actionVerb: 'Piped silky whipped frosting!',
    },
    {
      stepIndex: 2,
      id: 'toppings',
      badge: '🍓 STEP 3 • GARNISH & SERVE ORDER',
      station: 'Finishing Counter & Cash Register',
      ovenTemp: '350°F Golden Crisp',
      actionVerb: 'Crowned with toppings & served!',
    },
  ];

  const RECIPES = [
    {
      id: 'strawberry-cake',
      name: 'Strawberry Crown Cake',
      icon: '🎂',
      fairyId: 'heartsping',
      customerName: 'Heartsping',
      customerSymbol: '💖',
      priceCoins: 12,
      baseColor: '#fde68a',
      spongeStroke: '#d97706',
      frostingColor: '#ff6b9d',
      toppingEmoji: '🍓',
      desc: 'Fluffy vanilla sponge layered with pink strawberry cream and ruby berries!',
      readingSteps: [
        {
          sentence: 'Pour the warm milk and ______ into the mixing bowl.',
          answer: 'flour',
          choices: ['flour', 'shoes', 'clouds', 'rocks'],
        },
        {
          sentence: 'Spread sweet pink ______ on top of the soft cake.',
          answer: 'cream',
          choices: ['cream', 'sand', 'paper', 'broom'],
        },
        {
          sentence: 'Place a bright red ______ on the crown of the cake!',
          answer: 'berry',
          choices: ['berry', 'truck', 'pencil', 'clock'],
        },
      ],
    },
    {
      id: 'macaron-tower',
      name: 'Rainbow Macaron Tower',
      icon: '🧁',
      fairyId: 'lalaping',
      customerName: 'Lalaping',
      customerSymbol: '🎵',
      priceCoins: 15,
      baseColor: '#fed7aa',
      spongeStroke: '#ea580c',
      frostingColor: '#c084fc',
      toppingEmoji: '🍬',
      desc: 'Crisp almond meringue shells stacked with musical berry ganache!',
      readingSteps: [
        {
          sentence: 'Whisk the egg whites until they are light and ______.',
          answer: 'fluffy',
          choices: ['fluffy', 'heavy', 'muddy', 'sleepy'],
        },
        {
          sentence: 'Pipe round purple ______ cookies onto the baking tray.',
          answer: 'sweet',
          choices: ['sweet', 'salty', 'noisy', 'wooden'],
        },
        {
          sentence: 'Stack the cookies high like a singing ______!',
          answer: 'tower',
          choices: ['tower', 'river', 'blanket', 'spoon'],
        },
      ],
    },
    {
      id: 'matcha-parfait',
      name: 'Clover Matcha Parfait',
      icon: '🍨',
      fairyId: 'chachaping',
      customerName: 'Chachaping',
      customerSymbol: '🍀',
      priceCoins: 10,
      baseColor: '#bbf7d0',
      spongeStroke: '#16a34a',
      frostingColor: '#4ade80',
      toppingEmoji: '🍀',
      desc: 'Layered green tea sponge, vanilla bean ice cream, and lucky honey wafers!',
      readingSteps: [
        {
          sentence: 'Scoop the cold vanilla ice cream into a tall ______.',
          answer: 'glass',
          choices: ['glass', 'boot', 'pillow', 'forest'],
        },
        {
          sentence: 'Drizzle golden ______ over the green clover cream.',
          answer: 'honey',
          choices: ['honey', 'paint', 'gravel', 'feathers'],
        },
        {
          sentence: 'Top the parfait with a crisp wafer ______!',
          answer: 'cookie',
          choices: ['cookie', 'hammer', 'ladder', 'button'],
        },
      ],
    },
    {
      id: 'waffle-sundae',
      name: 'Blazing Golden Waffle',
      icon: '🧇',
      fairyId: 'gogoping',
      customerName: 'Gogoping',
      customerSymbol: '🔥',
      priceCoins: 14,
      baseColor: '#fcd34d',
      spongeStroke: '#b45309',
      frostingColor: '#fb923c',
      toppingEmoji: '🍌',
      desc: 'Crispy Belgian waffle grid topped with caramel swirl and sliced bananas!',
      readingSteps: [
        {
          sentence: 'Pour the golden batter onto the hot waffle ______.',
          answer: 'iron',
          choices: ['iron', 'couch', 'bucket', 'garden'],
        },
        {
          sentence: 'Wait until the waffle bakes crisp and ______.',
          answer: 'brown',
          choices: ['brown', 'frozen', 'empty', 'quiet'],
        },
        {
          sentence: 'Add sliced yellow ______ and warm maple syrup!',
          answer: 'banana',
          choices: ['banana', 'pebble', 'helmet', 'crayon'],
        },
      ],
    },
    {
      id: 'blueberry-tart',
      name: 'Scholar Blueberry Tart',
      icon: '🥧',
      fairyId: 'dadaping',
      customerName: 'Dadaping',
      customerSymbol: '📖',
      priceCoins: 16,
      baseColor: '#fde047',
      spongeStroke: '#ca8a04',
      frostingColor: '#60a5fa',
      toppingEmoji: '🫐',
      desc: 'Buttery shortbread crust filled with lemon custard and fresh blueberries!',
      readingSteps: [
        {
          sentence: 'Roll the butter dough flat with a wooden ______ pin.',
          answer: 'rolling',
          choices: ['rolling', 'jumping', 'singing', 'flying'],
        },
        {
          sentence: 'Fill the baked crust with smooth yellow lemon ______.',
          answer: 'custard',
          choices: ['custard', 'cardboard', 'marbles', 'leaves'],
        },
        {
          sentence: 'Arrange fresh blue ______ neatly in a circle!',
          answer: 'berries',
          choices: ['berries', 'erasers', 'mittens', 'wheels'],
        },
      ],
    },
    {
      id: 'cotton-cupcake',
      name: 'Bubble Cloud Cupcake',
      icon: '🧁',
      fairyId: 'happyping',
      customerName: 'Happyping',
      customerSymbol: '🫧',
      priceCoins: 11,
      baseColor: '#fbcfe8',
      spongeStroke: '#db2777',
      frostingColor: '#e879f9',
      toppingEmoji: '🍒',
      desc: 'Sparkling pink cupcake crowned with cotton-candy clouds and a sweet cherry!',
      readingSteps: [
        {
          sentence: 'Spoon the pink batter into paper cupcake ______.',
          answer: 'cups',
          choices: ['cups', 'hats', 'boats', 'trees'],
        },
        {
          sentence: 'Swirl fluffy purple ______ high like a soft cloud.',
          answer: 'frosting',
          choices: ['frosting', 'cement', 'feathers', 'buttons'],
        },
        {
          sentence: 'Sprinkle rainbow stars and a shiny red ______ on top!',
          answer: 'cherry',
          choices: ['cherry', 'potato', 'wrench', 'anchor'],
        },
      ],
    },
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getRecipes() {
    return RECIPES.slice();
  }

  function pickOrder(orderNumber = 1, preferredFairyId = null, previousRecipeId = null) {
    let pool = RECIPES.filter((r) => r.id !== previousRecipeId);
    if (pool.length === 0) pool = RECIPES.slice();

    let chosen = null;
    if (preferredFairyId && Math.random() < 0.45) {
      chosen = pool.find((r) => r.fairyId === preferredFairyId);
    }
    if (!chosen) {
      chosen = pool[Math.floor(Math.random() * pool.length)];
    }

    return {
      orderNo: 100 + orderNumber,
      recipe: chosen,
      currentStep: 0, // 0: base, 1: frosting, 2: toppings, 3: completed
      starsEarned: 3,
      mistakes: 0,
    };
  }

  function getStepMetadata(stepIndex) {
    return STEP_META[Math.min(STEP_META.length - 1, Math.max(0, stepIndex))];
  }

  // Reuses existing MathEngine / RaceEngine or WORD_LEVELS + recipe cloze
  function makeStepQuestion(category, order, MathEngine, WORD_LEVELS, RaceEngine) {
    const stepIdx = order ? Math.min(2, Math.max(0, order.currentStep)) : 0;
    const recipe = order && order.recipe ? order.recipe : RECIPES[0];
    const stepMeta = getStepMetadata(stepIdx);

    let chosenCat = category;
    if (category === 'mix' || !category) {
      chosenCat = Math.random() < 0.5 ? 'math' : 'reading';
    }

    if (chosenCat === 'math') {
      // Delegate core math generation to existing RaceEngine / MathEngine without changing generators
      if (RaceEngine && typeof RaceEngine.makeMathQuestion === 'function' && MathEngine) {
        const baseQ = RaceEngine.makeMathQuestion(MathEngine);
        const kitchenContexts = [
          `🥣 Measure ${baseQ.prompt} grams of flour for ${recipe.name}:`,
          `🌡️ Adjust oven heat (${baseQ.prompt}) for ${recipe.name}:`,
          `🪙 Ring up ${recipe.customerName}'s bakery bill (${baseQ.prompt}):`,
        ];
        return {
          ...baseQ,
          category: 'math',
          badge: stepMeta.badge,
          prompt: kitchenContexts[stepIdx % kitchenContexts.length],
          equation: baseQ.prompt,
          speechText: `Step ${stepIdx + 1} for ${recipe.name}. What is ${baseQ.speechText.replace(/^What is /i, '')}`,
        };
      }
    }

    // Reading mode: alternate between Recipe Card Cloze and existing WORD_LEVELS sight words
    const useRecipeCloze = Math.random() < 0.6 || !RaceEngine || !WORD_LEVELS;
    if (useRecipeCloze && recipe.readingSteps && recipe.readingSteps[stepIdx]) {
      const rStep = recipe.readingSteps[stepIdx];
      const choices = shuffle(rStep.choices).map((w) => ({
        text: w,
        value: w,
        isCorrect: w === rStep.answer,
      }));
      const textUpToBlank = rStep.sentence.split('______')[0].trim();
      return {
        category: 'reading',
        subType: 'recipe-cloze',
        badge: stepMeta.badge,
        prompt: `📖 Recipe Card: "${rStep.sentence}"`,
        speechText: textUpToBlank,
        answer: rStep.answer,
        choices,
      };
    }

    if (RaceEngine && typeof RaceEngine.makeReadingQuestion === 'function' && WORD_LEVELS) {
      const readQ = RaceEngine.makeReadingQuestion(WORD_LEVELS);
      return {
        ...readQ,
        category: 'reading',
        badge: stepMeta.badge,
      };
    }

    // Fallback
    const fallbackStep = RECIPES[0].readingSteps[0];
    const fallbackTextUpToBlank = fallbackStep.sentence.split('______')[0].trim();
    return {
      category: 'reading',
      subType: 'recipe-cloze',
      badge: stepMeta.badge,
      prompt: `📖 Recipe Card: "${fallbackStep.sentence}"`,
      speechText: fallbackTextUpToBlank,
      answer: fallbackStep.answer,
      choices: shuffle(fallbackStep.choices).map((w) => ({
        text: w,
        value: w,
        isCorrect: w === fallbackStep.answer,
      })),
    };
  }

  // Generates a realistic layered SVG illustration of the kitchen counter,
  // convection oven window, marble cake stand, and the dessert at stage 0..3.
  function renderKitchenSvg(order) {
    const recipe = (order && order.recipe) || RECIPES[0];
    const stage = order ? order.currentStep : 0; // 0 = empty plate, 1 = sponge base, 2 = frosted, 3 = finished

    const baseLayer = stage >= 1
      ? `<g class="cake-layer-base">
           <rect x="115" y="108" width="130" height="36" rx="10" fill="${recipe.baseColor}" stroke="${recipe.spongeStroke}" stroke-width="3"/>
           <line x1="122" y1="126" x2="238" y2="126" stroke="${recipe.spongeStroke}" stroke-width="2" stroke-dasharray="6 4" opacity="0.55"/>
         </g>`
      : `<g class="cake-layer-empty">
           <ellipse cx="180" cy="138" rx="52" ry="7" fill="rgba(255,255,255,0.25)"/>
           <text x="180" y="118" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="700">Solve Step 1 to pour batter!</text>
         </g>`;

    const frostingLayer = stage >= 2
      ? `<g class="cake-layer-frosting">
           <rect x="125" y="80" width="110" height="32" rx="10" fill="#fffbeb" stroke="${recipe.spongeStroke}" stroke-width="2.5"/>
           <path d="M115 110 Q126 122 137 110 T159 110 T181 110 T203 110 T225 110 T245 110 L245 102 L115 102 Z" fill="${recipe.frostingColor}"/>
           <path d="M125 84 Q136 96 147 84 T169 84 T191 84 T213 84 T235 84 L235 76 L125 76 Z" fill="${recipe.frostingColor}"/>
         </g>`
      : '';

    const toppingLayer = stage >= 3
      ? `<g class="cake-layer-toppings">
           <circle cx="150" cy="72" r="9" fill="#fff" opacity="0.9"/>
           <circle cx="180" cy="68" r="11" fill="#fff" opacity="0.95"/>
           <circle cx="210" cy="72" r="9" fill="#fff" opacity="0.9"/>
           <text x="150" y="76" text-anchor="middle" font-size="15">${recipe.toppingEmoji}</text>
           <text x="180" y="73" text-anchor="middle" font-size="18">${recipe.toppingEmoji}</text>
           <text x="210" y="76" text-anchor="middle" font-size="15">${recipe.toppingEmoji}</text>
           <text x="96" y="64" font-size="18">✨</text>
           <text x="252" y="64" font-size="18">✨</text>
           <text x="180" y="44" text-anchor="middle" font-size="16">👑</text>
         </g>`
      : '';

    const ovenGlow = stage >= 2 ? '#fb923c' : '#38bdf8';

    return `<svg viewBox="0 0 360 190" class="bakery-stage-svg" role="img" aria-label="${recipe.name} preparation stage ${stage} of 3">
      <defs>
        <linearGradient id="bk-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2e1065"/>
          <stop offset="65%" stop-color="#4c1d95"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
        <linearGradient id="bk-counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fdf2f8"/>
          <stop offset="100%" stop-color="#fbcfe8"/>
        </linearGradient>
      </defs>
      <!-- Bakery Wall & Striped Awning -->
      <rect width="360" height="190" fill="url(#bk-wall)"/>
      <g>
        <rect x="0" y="0" width="45" height="22" fill="#f43f5e"/>
        <rect x="45" y="0" width="45" height="22" fill="#fff1f2"/>
        <rect x="90" y="0" width="45" height="22" fill="#f43f5e"/>
        <rect x="135" y="0" width="45" height="22" fill="#fff1f2"/>
        <rect x="180" y="0" width="45" height="22" fill="#f43f5e"/>
        <rect x="225" y="0" width="45" height="22" fill="#fff1f2"/>
        <rect x="270" y="0" width="45" height="22" fill="#f43f5e"/>
        <rect x="315" y="0" width="45" height="22" fill="#fff1f2"/>
      </g>
      <!-- Convection Oven Window (Left) -->
      <rect x="14" y="34" width="74" height="68" rx="10" fill="#1e293b" stroke="#94a3b8" stroke-width="2.5"/>
      <rect x="21" y="42" width="60" height="40" rx="6" fill="#0f172a" stroke="${ovenGlow}" stroke-width="1.5"/>
      <line x1="25" y1="72" x2="77" y2="72" stroke="#f97316" stroke-width="2.5"/>
      <text x="51" y="63" text-anchor="middle" fill="#fde047" font-size="10" font-weight="800">${stage >= 2 ? '350°F 🔥' : 'WARM ♨️'}</text>
      <circle cx="34" cy="92" r="4" fill="#22c55e"/>
      <circle cx="51" cy="92" r="4" fill="#f59e0b"/>
      <circle cx="68" cy="92" r="4" fill="#ef4444"/>

      <!-- Digital Recipe Scale (Right) -->
      <rect x="274" y="54" width="72" height="48" rx="10" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <rect x="282" y="62" width="56" height="22" rx="4" fill="#022c22"/>
      <text x="310" y="77" text-anchor="middle" fill="#34d399" font-size="11" font-weight="800">${stage * 125}g OK</text>
      <text x="310" y="96" text-anchor="middle" fill="#cbd5e1" font-size="8" font-weight="700">PATISSERIE SCALE</text>

      <!-- Marble Countertop & Pedestal Cake Turntable -->
      <rect x="0" y="154" width="360" height="36" fill="url(#bk-counter)"/>
      <line x1="0" y1="154" x2="360" y2="154" stroke="#f472b6" stroke-width="3"/>
      <path d="M152 156 L208 156 L196 144 L164 144 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <ellipse cx="180" cy="144" rx="76" ry="9" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5"/>

      <!-- Assembled Cake Layers -->
      ${baseLayer}
      ${frostingLayer}
      ${toppingLayer}
    </svg>`;
  }

  const api = {
    TARGET_ORDERS_FOR_VICTORY,
    STEPS_PER_ORDER,
    RECIPES,
    STEP_META,
    getRecipes,
    pickOrder,
    getStepMetadata,
    makeStepQuestion,
    renderKitchenSvg,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof root !== 'undefined') {
    root.BakeryEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
