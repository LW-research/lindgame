const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const CityHeroEngine = require('../js/cities.js');

describe('CityHeroEngine', () => {
  it('contains the 4 required default world cities', () => {
    const cities = CityHeroEngine.getCities();
    assert.ok(cities.length >= 4, 'Must have at least 4 cities');
    const ids = cities.map((c) => c.id);
    ['tokyo', 'washington-dc', 'beijing', 'shanghai'].forEach((id) => {
      assert.ok(ids.includes(id), `Missing required city ${id}`);
    });
  });

  it('validates city schema and exploration stops', () => {
    const cities = CityHeroEngine.getCities();
    cities.forEach((city) => {
      assert.ok(city.name, 'City must have name');
      assert.ok(city.country, 'City must have country');
      assert.ok(city.flag, 'City must have flag');
      assert.ok(city.currency, 'City must have currency');
      assert.ok(Array.isArray(city.stops) && city.stops.length === 4, 'City must have 4 exploration stops');

      const stopTypes = city.stops.map((s) => s.type);
      assert.ok(stopTypes.includes('landmark'), 'Must have landmark stop');
      assert.ok(stopTypes.includes('food'), 'Must have food stop');
      assert.ok(stopTypes.includes('culture'), 'Must have culture stop');
      assert.ok(stopTypes.includes('souvenir'), 'Must have souvenir stop');

      city.stops.forEach((stop) => {
        assert.ok(stop.id, 'Stop must have id');
        assert.ok(stop.title, 'Stop must have title');
        assert.ok(stop.fact, 'Stop must have fact');
        assert.ok(stop.reward, 'Stop must have reward');
        assert.ok(stop.reward.name, 'Reward must have name');
        assert.ok(stop.reward.icon, 'Reward must have icon');
      });
    });
  });

  it('generates accurate reading cloze puzzles for landmark/culture stops', () => {
    const tokyo = CityHeroEngine.getCity('tokyo');
    const towerStop = tokyo.stops.find((s) => s.type === 'landmark');
    const puzzle = CityHeroEngine.makeStopPuzzle(tokyo, towerStop);

    assert.equal(puzzle.type, 'reading');
    assert.ok(puzzle.prompt.includes('______'), 'Prompt must contain blank placeholder');
    assert.equal(puzzle.choices.length, 4, 'Must provide 4 choices');
    const correctChoices = puzzle.choices.filter((c) => c.isCorrect);
    assert.equal(correctChoices.length, 1, 'Must have exactly one correct choice');
    assert.equal(correctChoices[0].text, towerStop.missingWord);
    assert.ok(puzzle.reward, 'Puzzle must reference stop reward');
  });

  it('generates accurate math market puzzles for food/souvenir stops', () => {
    const dc = CityHeroEngine.getCity('washington-dc');
    const foodStop = dc.stops.find((s) => s.type === 'food');
    const puzzle = CityHeroEngine.makeStopPuzzle(dc, foodStop);

    assert.equal(puzzle.type, 'math');
    assert.ok(puzzle.story, 'Must have math story context');
    assert.equal(puzzle.choices.length, 4, 'Must provide 4 choices');
    const correctChoices = puzzle.choices.filter((c) => c.isCorrect);
    assert.equal(correctChoices.length, 1, 'Must have exactly one correct answer');
    assert.equal(correctChoices[0].value, foodStop.mathAnswer);
  });

  it('architecture allows dynamically registering new cities', () => {
    const parisConfig = {
      id: 'paris',
      name: 'Paris',
      country: 'France',
      flag: '🇫🇷',
      icon: '🥐',
      themeColor: '#6366f1',
      skyGradient: 'linear-gradient(135deg, #1e1b4b, #3b82f6)',
      heroMissionTitle: 'Paris Light Hero Quest',
      greeting: 'Bonjour! Welcome to Paris, France!',
      currency: 'Euros 💶',
      stops: [
        {
          id: 'paris-eiffel',
          type: 'landmark',
          title: 'Eiffel Tower',
          icon: '🗼',
          fact: 'The famous iron tower of Paris!',
          puzzleType: 'reading',
          readingPassage: 'The iron tower reaches high into the blue sky.',
          missingWord: 'sky',
          readingChoices: ['sky', 'mud', 'snow', 'sand'],
          reward: { id: 'paris-badge-eiffel', name: 'Golden Eiffel Key', icon: '🗼', type: 'landmark' },
        },
        {
          id: 'paris-croissant',
          type: 'food',
          title: 'French Bakery Croissants',
          icon: '🥐',
          fact: 'Flaky buttery pastries baked fresh every morning!',
          puzzleType: 'math',
          mathStory: 'You buy 3 butter croissants for 2 euros each. Total cost is 6 euros.',
          mathA: 3,
          mathOp: '+',
          mathB: 3,
          mathAnswer: 6,
          reward: { id: 'paris-food-croissant', name: 'Warm Butter Croissant', icon: '🥐', type: 'food' },
        },
        {
          id: 'paris-louvre',
          type: 'culture',
          title: 'Louvre Glass Pyramid',
          icon: '🏛️',
          fact: 'Home of the famous Mona Lisa painting!',
          puzzleType: 'reading',
          readingPassage: 'Beautiful art paintings hang on the museum wall.',
          missingWord: 'wall',
          readingChoices: ['wall', 'river', 'forest', 'spoon'],
          reward: { id: 'paris-badge-louvre', name: 'Pyramid Crystal', icon: '🏛️', type: 'culture' },
        },
        {
          id: 'paris-beret',
          type: 'souvenir',
          title: 'Montmartre Beret & Paint Shop',
          icon: '🎨',
          fact: 'Artists paint lovely portraits along the cobblestone hills!',
          puzzleType: 'math',
          mathStory: 'A painter palette is 8 euros. You pay with 10 euros. Change is 2 euros.',
          mathA: 10,
          mathOp: '-',
          mathB: 8,
          mathAnswer: 2,
          reward: { id: 'paris-souvenir-beret', name: 'Artist Painter Palette', icon: '🎨', type: 'souvenir' },
        },
      ],
    };

    CityHeroEngine.registerCity(parisConfig);
    const retrieved = CityHeroEngine.getCity('paris');
    assert.ok(retrieved !== null, 'Registered city must be retrievable');
    assert.equal(retrieved.name, 'Paris');
    assert.equal(retrieved.stops.length, 4);

    const puzzle = CityHeroEngine.makeStopPuzzle(retrieved, retrieved.stops[1]);
    assert.equal(puzzle.correctAnswer, 6);
  });

  it('rejects invalid city configurations without required fields', () => {
    assert.throws(() => {
      CityHeroEngine.registerCity({ id: 'broken' });
    }, /Invalid city configuration/);
  });

  it('generates panoramic SVG landmark dioramas and realistic flight metadata for every city and stop', () => {
    const cities = CityHeroEngine.getCities();
    cities.forEach((city) => {
      const meta = CityHeroEngine.getCityFlightMeta(city);
      assert.ok(meta.flightNo && meta.flightNo.startsWith('TP-'), 'Flight number must start with TP-');
      assert.ok(meta.airport, 'Must include airport code');
      assert.ok(meta.weather, 'Must include local weather');

      city.stops.forEach((stop) => {
        const svg = CityHeroEngine.getStopSceneSvg(city, stop);
        assert.ok(svg.startsWith('<svg') && svg.includes('</svg>'), `Stop ${stop.id} must return valid SVG markup`);
      });
    });
  });
});

