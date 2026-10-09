/* Game content: planets (math levels), word-problem templates, and reading word lists. */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MISSION_LENGTH = 5;
const WORD_ROUNDS = 8;

// Each planet is a math level (problems are randomly generated). Stars from any game unlock the next planet.
// digits: how many digits each number has (up to 4). regroup: carrying/borrowing (true/false/'mixed').
const PLANETS = [
  { id: 'moon', name: 'The Moon', label: 'Adding • 23 + 14', ops: ['add'], digits: 2, regroup: false, starsNeeded: 0, accent: '#dfe3f5' },
  { id: 'mars', name: 'Mars', label: 'Taking away • 47 − 15', ops: ['sub'], digits: 2, regroup: false, starsNeeded: 4, accent: '#ff8a5c' },
  { id: 'jupiter', name: 'Jupiter', label: 'Carry & trade • 38 + 27', ops: ['add', 'sub'], digits: 2, regroup: true, starsNeeded: 10, accent: '#f0b77a' },
  { id: 'saturn', name: 'Saturn', label: 'Hundreds • 352 + 415', ops: ['add', 'sub'], digits: 3, regroup: false, starsNeeded: 16, accent: '#ffd166' },
  { id: 'uranus', name: 'Uranus', label: 'Hundreds, carry & trade • 486 − 259', ops: ['add', 'sub'], digits: 3, regroup: true, starsNeeded: 24, accent: '#7ee8e0' },
  { id: 'neptune', name: 'Neptune', label: 'Thousands • 4213 + 2564', ops: ['add', 'sub'], digits: 4, regroup: false, starsNeeded: 32, accent: '#6ea8ff' },
  { id: 'station', name: 'Star Station', label: 'Thousands super mix!', ops: ['add', 'sub'], digits: 4, regroup: 'mixed', starsNeeded: 40, accent: '#c3a6ff' },
];

const FRIENDS = [
  { name: 'Heartsping', he: 'She' }, { name: 'Lalaping', he: 'She' }, { name: 'Chachaping', he: 'She' },
  { name: 'Gogoping', he: 'He' }, { name: 'Dadaping', he: 'He' }, { name: 'Happyping', he: 'She' },
  { name: 'Romi', he: 'She' }, { name: 'Mia', he: 'She' }, { name: 'Leo', he: 'He' },
  { name: 'Zara', he: 'She' }, { name: 'Sam', he: 'He' }, { name: 'Ava', he: 'She' },
];

const THINGS = [
  { word: 'magic berries', emoji: '🍓' }, { word: 'heart gems', emoji: '💖' },
  { word: 'lucky clovers', emoji: '🍀' }, { word: 'magic bubbles', emoji: '🫧' },
  { word: 'stars', emoji: '⭐' }, { word: 'moon rocks', emoji: '🪨' },
  { word: 'apples', emoji: '🍎' }, { word: 'cookies', emoji: '🍪' },
  { word: 'books', emoji: '📚' }, { word: 'shells', emoji: '🐚' },
];

// Short sentences built mostly from Dolch sight words.
const STORY_TEMPLATES = {
  add: [
    (n, t, a, b) => `${n.name} has ${a} ${t}. ${n.he} gets ${b} more. How many ${t} does ${n.name} have now?`,
    (n, t, a, b) => `The magic box has ${a} ${t}. ${n.name} puts in ${b} more. How many ${t} are in the box now?`,
    (n, t, a, b) => `${n.name} found ${a} ${t} on Monday and ${b} ${t} on Tuesday. How many ${t} did ${n.name} find in all?`,
  ],
  sub: [
    (n, t, a, b) => `${n.name} has ${a} ${t}. ${n.he} gives ${b} to a friend. How many ${t} does ${n.name} have left?`,
    (n, t, a, b) => `The magic pouch has ${a} ${t}. Then ${b} of them fall out. How many ${t} are still in the pouch?`,
    (n, t, a, b) => `${n.name} had ${a} ${t}. ${n.he} shared ${b} with friends. How many ${t} does ${n.name} have now?`,
  ],
};

function makeStory(p) {
  const friend = pick(FRIENDS);
  const thing = pick(THINGS);
  return { text: pick(STORY_TEMPLATES[p.op])(friend, thing.word, p.a, p.b), emoji: thing.emoji };
}

// Word Hunt levels: Dolch sight words (listen & find) + picture words (read & match).
const WORD_LEVELS = [
  {
    id: 'little', name: 'Little Words', emoji: '🐣',
    sight: ['a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'],
    pictures: [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['bus', '🚌'], ['hat', '🎩'], ['pig', '🐷'], ['bed', '🛏️'], ['fox', '🦊'], ['bug', '🐛'], ['egg', '🥚'], ['box', '📦'], ['web', '🕸️'], ['map', '🗺️'], ['bat', '🦇'], ['hen', '🐔'], ['ant', '🐜']],
  },
  {
    id: 'bigger', name: 'Bigger Words', emoji: '🦊',
    sight: ['all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came', 'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like', 'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran', 'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this', 'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will', 'with', 'yes'],
    pictures: [['fish', '🐟'], ['frog', '🐸'], ['duck', '🦆'], ['ship', '🚢'], ['star', '⭐'], ['moon', '🌙'], ['tree', '🌳'], ['cake', '🎂'], ['kite', '🪁'], ['bike', '🚲'], ['boat', '⛵'], ['snail', '🐌'], ['drum', '🥁'], ['bell', '🔔'], ['shoe', '👟'], ['bee', '🐝']],
  },
  {
    id: 'bigkid', name: 'Big-Kid Words', emoji: '🚀',
    sight: ['after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when'],
    pictures: [['rocket', '🚀'], ['planet', '🪐'], ['apple', '🍎'], ['robot', '🤖'], ['rabbit', '🐰'], ['turtle', '🐢'], ['flower', '🌸'], ['pencil', '✏️'], ['rainbow', '🌈'], ['monkey', '🐵'], ['dragon', '🐉'], ['pizza', '🍕'], ['castle', '🏰'], ['alien', '👽'], ['banana', '🍌'], ['penguin', '🐧']],
  },
];

const PRAISE = [
  'Heart power! Chuping! 💖',
  'Lala! Sing with joy! 🎵',
  'Hope blooms, chacha! 🍀',
  'Never give up, gogo! 🔥',
  'Proper and neat, dada! 📖',
  'Pop, pop! Happy smile! 🫧',
  'Great job! Star magic! ⭐',
  'Wonderful! You did it! ✨',
];

// Turns a generated article (see js/stories.js) with [[correct|wrong|wrong]] blanks into
// paragraph segments + blank objects for the Story Time reader.
function parseArticle(article) {
  let blankCounter = 0;
  const blanks = [];
  const parsedParagraphs = article.paragraphs.map((para) => {
    const segments = [];
    const regex = /\[\[(.*?)\|(.*?)\|(.*?)\]\]/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(para)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', text: para.slice(lastIndex, match.index) });
      }
      const bIndex = blankCounter++;
      const correct = match[1];
      const distractors = [match[2], match[3]];
      const choices = shuffle([correct, ...distractors]);
      const blankObj = {
        index: bIndex,
        correct,
        distractors,
        choices,
      };
      blanks.push(blankObj);
      segments.push({ type: 'blank', blankIndex: bIndex });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < para.length) {
      segments.push({ type: 'text', text: para.slice(lastIndex) });
    }
    return segments;
  });
  return { ...article, parsedParagraphs, blanks };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    pick,
    shuffle,
    MISSION_LENGTH,
    WORD_ROUNDS,
    PLANETS,
    FRIENDS,
    THINGS,
    STORY_TEMPLATES,
    makeStory,
    WORD_LEVELS,
    PRAISE,
    parseArticle,
  };
}


