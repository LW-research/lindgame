/* Story generator: builds a fresh first-grade reading passage every time.
   Each theme has 4 paragraphs; each paragraph has several sentence variants.
   A random cast (names, pet, color, food) fills the story, and a random set of
   fill-in-the-blank words is chosen from the [[correct|wrong|wrong]] candidates.
   Works in the browser (window.StoryGen) and in Node (module.exports) for tests. */
(function (root) {
  'use strict';

  const BLANKS_PER_STORY = 5;
  const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const mix = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const KIDS = [
    ['Mia', 'f'], ['Leo', 'm'], ['Zara', 'f'], ['Sam', 'm'], ['Ava', 'f'], ['Max', 'm'],
    ['Lily', 'f'], ['Ben', 'm'], ['Emma', 'f'], ['Jack', 'm'], ['Nora', 'f'], ['Omar', 'm'],
  ];
  const PETS = ['dog', 'puppy', 'cat', 'kitten', 'bunny'];
  const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
  const FOODS = ['pizza', 'pancakes', 'tacos', 'soup', 'noodles', 'rice and beans'];

  function makeCast() {
    const [hero, friend] = mix(KIDS);
    const girl = hero[1] === 'f';
    return {
      H: hero[0], F: friend[0],
      He: girl ? 'She' : 'He', he: girl ? 'she' : 'he',
      His: girl ? 'Her' : 'His', his: girl ? 'her' : 'his', him: girl ? 'her' : 'him',
      pet: choose(PETS), color: choose(COLORS), food: choose(FOODS),
    };
  }

  // Short sentences, mostly Dolch/Fry sight words and decodable words (Grade 1).
  const STORY_THEMES = [
    {
      id: 'teenieping', name: 'Teenieping Magic', emoji: '💖', accent: '#ff6b9d',
      title: (c) => choose([`${c.H} and Heartsping`, `${c.H}'s Teenieping Adventure`, `The Teenieping Quest with ${c.H}`]),
      paragraphs: [
        [
          (c) => `One sunny day in Harmony Town, ${c.H} met [[Heartsping|a chair|a rock]]. Heartsping flapped her tiny ears and shared a sweet [[smile|shoe|fork]]. "Let us spread love and magic today, chuping!"`,
          (c) => `In the magical kingdom, the fairy Teeniepings gathered in the [[garden|oven|ocean]]. Lalaping was humming a cheerful [[song|blanket|sock]]. She danced around the flowers with joyful energy.`,
        ],
        [
          (c) => `Chachaping watered a patch of four-leaf [[clovers|books|pots]] with her little watering can. "Hope blooms when we work [[hard|sleepy|sour]], chacha!" she cheered with a bright beam.`,
          (c) => `Gogoping zoomed through the air wearing his blue [[headband|spoon|banana]]. "Never give up!" he shouted with great [[courage|mud|sleep]]. "Heroes always help their friends, gogo!"`,
        ],
        [
          (c) => `Dadaping adjusted his round glasses and opened a blue [[book|cup|cloud]]. "Let us solve each puzzle step by [[step|soap|sand]], dada!" he explained with wise patience.`,
          (c) => `Happyping blew shiny magic [[bubbles|tables|sticks]] into the gentle breeze. Each floating bubble sparkled with rainbow [[colors|stones|shoes]]. "Pop, pop! Happiness is everywhere!"`,
        ],
        [
          (c) => `All the Teeniepings held hands in a glowing magic [[circle|basket|hat]]. Their magic wand flashed with brilliant [[light|dust|rain]]. Together with ${c.H}, they saved the day with love!`,
          (c) => `${c.H} held up the magic compact and caught a lost Teenieping in the [[cube|pot|boat]]. Everyone shouted, "Catch! We did it [[together|yesterday|alone]]!" What a magical day!`,
        ],
      ],
    },
    {
      id: 'space', name: 'Space Trip', emoji: '🚀', accent: '#6ec8ff',
      title: (c) => `${c.H}'s Space Trip`,
      paragraphs: [
        [
          (c) => `${c.H} wanted to fly to the [[moon|soup|bed]]. ${c.He} put on a white space suit and a big [[helmet|banana|pillow]]. Then ${c.he} got into ${c.his} ${c.color} rocket.`,
          (c) => `${c.H} had a ${c.color} rocket. One day, ${c.he} said, "I want to see the [[stars|socks|eggs]] up close!" ${c.He} climbed in and shut the [[door|cake|tree]].`,
        ],
        [
          (c) => `"Three, two, one, blast off!" The rocket went up, up, up. ${c.H} looked out the [[window|carrot|spoon]]. The Earth looked small and [[round|hungry|sleepy]].`,
          (c) => `The rocket shook and roared. Soon it was far above the [[clouds|fish|chairs]]. Out in space, it was dark and [[quiet|sticky|salty]].`,
        ],
        [
          (c) => `The rocket landed on the moon with a soft bump. ${c.H} stepped out and took a big [[jump|nap|bath]]. ${c.He} floated up so high!`,
          (c) => `On the moon, ${c.H} saw gray rocks and deep holes. ${c.He} put a small [[rock|cat|cloud]] in ${c.his} bag. ${c.He} wanted to show it to ${c.F}.`,
        ],
        [
          (c) => `Then it was time to go [[home|swim|sing]]. The rocket zoomed back to Earth. ${c.H} told ${c.F} all about the [[trip|soup|sock]]. Then they ate ${c.food} together.`,
          (c) => `${c.H} flew back to Earth and landed in ${c.his} [[yard|cup|shoe]]. "Space is so cool!" ${c.he} said. That night, ${c.he} looked up at the moon and [[smiled|barked|melted]].`,
        ],
      ],
    },
    {
      id: 'park', name: 'Fun at the Park', emoji: '🌳', accent: '#4be3b0',
      title: (c) => `${c.H} at the Park`,
      paragraphs: [
        [
          (c) => `It was a warm and sunny day. ${c.H} and ${c.his} ${c.pet} walked to the [[park|ocean|oven]]. The sky was [[blue|loud|sour]], and the grass was soft and green.`,
          (c) => `${c.H} woke up and looked out the window. The [[sun|soup|shoe]] was shining! "Let's go to the park," ${c.he} said to ${c.his} ${c.pet}.`,
        ],
        [
          (c) => `At the park, ${c.H} saw ${c.his} friend ${c.F}. ${c.F} had a ${c.color} [[kite|cake|bed]]. The wind lifted it up into the [[sky|cup|sink]].`,
          (c) => `${c.H} ran to the big slide. ${c.He} climbed up the [[ladder|pickle|pillow]] and slid down fast. "Wheee!" ${c.he} [[yelled|slept|chewed]].`,
        ],
        [
          (c) => `Next, ${c.H} sat on a swing. ${c.F} gave ${c.him} a little [[push|nap|bath]]. ${c.H} went up so high that ${c.he} felt like a [[bird|rock|spoon]].`,
          (c) => `The ${c.pet} found a red [[ball|cloud|lamp]] under a tree. ${c.H} threw it far, and the ${c.pet} ran to [[get|eat|paint]] it.`,
        ],
        [
          (c) => `Soon the sun began to go down. It was time to go [[home|swim|fly]]. ${c.H} ate ${c.food} for dinner. What a fun [[day|hat|box]]!`,
          (c) => `After a long day, ${c.H} felt [[tired|square|tall]]. ${c.He} gave ${c.his} ${c.pet} a big hug. ${c.He} will come back to the park [[tomorrow|yesterday|last]].`,
        ],
      ],
    },
    {
      id: 'farm', name: 'A Visit to the Farm', emoji: '🐄', accent: '#ffd166',
      title: (c) => `${c.H} Visits the Farm`,
      paragraphs: [
        [
          (c) => `${c.H} and ${c.his} family drove to a big farm. There was a red [[barn|boat|bell]] next to a green field. ${c.H} could hear the animals right away!`,
          (c) => `Today ${c.H} went to visit Grandpa's [[farm|rocket|bath]]. Grandpa had a tall hat and a big [[smile|fork|shoe]]. "Come and meet the animals!" he said.`,
        ],
        [
          (c) => `First, ${c.H} saw a cow. The cow said, "[[Moo|Quack|Meow]]!" She was eating green [[grass|rocks|socks]] in the sun.`,
          (c) => `${c.H} fed the pigs. The pigs rolled in the [[mud|sky|milk]] and made funny sounds. "Oink, oink!" said the biggest [[pig|tree|cup]].`,
        ],
        [
          (c) => `Next, ${c.H} looked for eggs in the hen house. ${c.He} found four brown [[eggs|shoes|kites]] in the hay. ${c.He} carried them in a little [[basket|puddle|cloud]].`,
          (c) => `Then ${c.H} got to ride a gentle [[horse|fish|table]]. It walked slowly around the field. ${c.H} held on tight and [[laughed|melted|barked]].`,
        ],
        [
          (c) => `At the end of the day, Grandpa gave ${c.H} a glass of cold [[milk|sand|paint]]. ${c.H} said, "Thank you! I love the farm." ${c.He} will come [[back|blue|loud]] soon.`,
          (c) => `On the way home, ${c.H} looked out the car window. ${c.He} waved goodbye to the [[animals|spoons|chairs]]. It was the best [[trip|sock|nose]] ever!`,
        ],
      ],
    },
    {
      id: 'beach', name: 'A Day at the Beach', emoji: '🏖️', accent: '#6ea8ff',
      title: (c) => `${c.H} at the Beach`,
      paragraphs: [
        [
          (c) => `${c.H} packed a bag for the beach. ${c.He} put in a towel, a hat, and a [[bucket|pillow|bike]]. ${c.His} friend ${c.F} came too!`,
          (c) => `It was a hot summer day. ${c.H} and ${c.F} went to the [[beach|moon|closet]]. The water was blue and the sand was [[warm|loud|sad]].`,
        ],
        [
          (c) => `${c.H} and ${c.F} built a big sand [[castle|cookie|rocket]]. They used a bucket and a small [[shovel|banana|pillow]]. Then they put a shell on top.`,
          (c) => `${c.H} ran into the water. A small wave splashed ${c.his} [[feet|hat|lunch]]. "It is so [[cold|tasty|purple]]!" ${c.he} said with a laugh.`,
        ],
        [
          (c) => `Next, they looked for shells. ${c.F} found a pink one. ${c.H} found a little [[crab|cow|cake]]! It walked sideways back into the [[water|oven|tree]].`,
          (c) => `A big gray bird flew over them. It was a [[seagull|pig|chair]]. It wanted some of their [[snack|shoes|sand]], but ${c.H} held on tight.`,
        ],
        [
          (c) => `When the sun went down, the sky turned pink and [[orange|furry|sleepy]]. ${c.H} and ${c.F} walked home with sandy toes. They were tired but [[happy|square|empty]].`,
          (c) => `At last it was time to go home. ${c.H} shook the sand out of ${c.his} [[shoes|soup|clouds]]. ${c.He} ate ${c.food} and went to [[bed|cake|rain]] early.`,
        ],
      ],
    },
    {
      id: 'garden', name: 'The Little Garden', emoji: '🌻', accent: '#ff7a8a',
      title: (c) => `${c.H}'s Garden`,
      paragraphs: [
        [
          (c) => `${c.H} wanted to grow a garden. ${c.He} dug small holes in the [[dirt|sky|milk]]. Then ${c.he} dropped one seed in each [[hole|cloud|cup]].`,
          (c) => `In the spring, ${c.H} and ${c.his} mom planted [[seeds|socks|forks]] in the yard. They made neat rows and patted the dirt [[down|blue|happy]].`,
        ],
        [
          (c) => `Every day, ${c.H} gave the seeds some [[water|candy|paint]]. ${c.He} used a ${c.color} watering can. The sun helped the seeds grow, too.`,
          (c) => `One morning, ${c.H} saw tiny green [[sprouts|shoes|boats]]! They were poking out of the ground. ${c.H} jumped up and down with [[joy|soup|rain]].`,
        ],
        [
          (c) => `The plants grew taller and taller. Soon there were bright yellow [[flowers|rocks|spoons]]. A fuzzy [[bee|car|bed]] came to visit each one.`,
          (c) => `A hungry bunny hopped into the garden. It wanted to eat the [[carrots|stones|boots]]! ${c.H} put up a little [[fence|cake|song]] to keep it out.`,
        ],
        [
          (c) => `At the end of summer, ${c.H} picked red tomatoes and green beans. ${c.He} shared them with ${c.F}. Food from your own garden tastes the [[best|loudest|tallest]]!`,
          (c) => `${c.H} was proud of ${c.his} garden. ${c.He} gave some flowers to ${c.F}. ${c.F} said, "Thank [[you|me|it]]! They smell so [[sweet|loud|fast]]."`,
        ],
      ],
    },
    {
      id: 'birthday', name: 'The Birthday Party', emoji: '🎂', accent: '#c3a6ff',
      title: (c) => `${c.H}'s Birthday`,
      paragraphs: [
        [
          (c) => `Today was ${c.H}'s birthday! ${c.He} was turning [[seven|green|soft]]. ${c.He} jumped out of bed with a big [[smile|shoe|carrot]].`,
          (c) => `${c.H} woke up very early. It was ${c.his} birthday! There were ${c.color} [[balloons|rocks|beds]] all over the kitchen.`,
        ],
        [
          (c) => `${c.His} friends came to the party. ${c.F} brought a box with a big [[bow|dog|tree]] on top. ${c.H} could not wait to [[open|eat|wash]] it.`,
          (c) => `Mom baked a [[cake|shoe|car]] with ${c.color} frosting. It had candles on top. Everyone sang "Happy Birthday" in a loud, happy [[voice|bath|hat]].`,
        ],
        [
          (c) => `${c.H} closed ${c.his} eyes and made a [[wish|ship|nose]]. Then ${c.he} blew out all the candles. Everyone [[clapped|slept|melted]] and cheered.`,
          (c) => `The kids played games in the yard. They ran, jumped, and [[laughed|melted|rusted]]. ${c.F} won the race, and ${c.H} won the [[game|soup|sky]] of tag.`,
        ],
        [
          (c) => `When the party was over, ${c.H} said thank you to everyone. ${c.He} felt very [[lucky|square|wet]]. It was the best birthday [[ever|under|green]]!`,
          (c) => `That night, ${c.H} looked at all ${c.his} new things. ${c.He} hugged ${c.his} ${c.pet}. "I love my [[birthday|bathtub|shoe]]," ${c.he} said, and fell [[asleep|upstairs|blue]].`,
        ],
      ],
    },
  ];

  const BLANK_RE = /\[\[(.*?)\]\]/g;

  // Returns an article in the shape parseArticle() expects:
  // { id, title, emoji, level, accent, paragraphs: ['... [[correct|wrong|wrong]] ...'] }
  function makeArticle(theme) {
    const c = makeCast();
    const paras = theme.paragraphs.map((variants) => choose(variants)(c));

    // Number every candidate blank, keep one per paragraph, then add random extras.
    let id = 0;
    const perPara = paras.map((p) => (p.match(BLANK_RE) || []).map(() => id++));
    const keep = new Set(perPara.filter((ids) => ids.length).map((ids) => choose(ids)));
    const rest = mix(perPara.flat().filter((i) => !keep.has(i)));
    while (keep.size < BLANKS_PER_STORY && rest.length) keep.add(rest.pop());

    // Candidates that weren't picked are printed as normal words.
    let k = 0;
    const paragraphs = paras.map((p) =>
      p.replace(BLANK_RE, (whole, inner) => (keep.has(k++) ? whole : inner.split('|')[0])));

    return {
      id: theme.id,
      title: theme.title(c),
      emoji: theme.emoji,
      level: 'Grade 1 • New story every time',
      accent: theme.accent,
      paragraphs,
    };
  }

  const api = { STORY_THEMES, BLANKS_PER_STORY, makeArticle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StoryGen = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
