const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const BakeryEngine = require('../js/bakery.js');
const MathEngine = require('../js/math.js');
const RaceEngine = require('../js/race.js');
const { WORD_LEVELS } = require('../js/data.js');

describe('BakeryEngine', () => {
  it('defines 6 signature Teenieping dessert recipes with 3 reading steps each', () => {
    const recipes = BakeryEngine.getRecipes();
    assert.equal(recipes.length, 6);
    recipes.forEach((r) => {
      assert.ok(r.id && r.name && r.icon, 'Recipe must have id, name, and icon');
      assert.ok(r.fairyId && r.customerName, 'Recipe must reference a Teenieping customer');
      assert.equal(r.readingSteps.length, 3, 'Each recipe must have 3 reading steps');
      r.readingSteps.forEach((step) => {
        assert.ok(step.sentence.includes('______'), 'Reading step must have cloze blank');
        assert.equal(step.choices.length, 4, 'Reading step must have 4 choices');
        assert.ok(step.choices.includes(step.answer), 'Choices must include correct answer');
      });
    });
  });

  it('pickOrder creates a valid order ticket and avoids consecutive duplicate recipes', () => {
    const order1 = BakeryEngine.pickOrder(1, 'heartsping', null);
    assert.equal(order1.orderNo, 101);
    assert.equal(order1.currentStep, 0);
    assert.ok(order1.recipe);

    for (let i = 0; i < 15; i++) {
      const order2 = BakeryEngine.pickOrder(2, null, order1.recipe.id);
      assert.notEqual(order2.recipe.id, order1.recipe.id);
    }
  });

  it('makeStepQuestion generates valid math and reading questions for each baking step', () => {
    const order = BakeryEngine.pickOrder(1, 'heartsping', null);

    // Math mode
    const mathQ = BakeryEngine.makeStepQuestion('math', order, MathEngine, WORD_LEVELS, RaceEngine);
    assert.equal(mathQ.category, 'math');
    assert.equal(mathQ.choices.length, 4);
    assert.equal(mathQ.choices.filter((c) => c.isCorrect).length, 1);

    // Reading mode
    const readQ = BakeryEngine.makeStepQuestion('reading', order, MathEngine, WORD_LEVELS, RaceEngine);
    assert.equal(readQ.category, 'reading');
    assert.equal(readQ.choices.length, 4);
    assert.equal(readQ.choices.filter((c) => c.isCorrect).length, 1);
    if (readQ.subType === 'recipe-cloze') {
      assert.ok(readQ.speechText && readQ.speechText.length > 0);
      assert.ok(!readQ.speechText.includes('______'), 'speechText must not say blank');
      assert.ok(!readQ.speechText.includes(readQ.answer), 'speechText must stop before the answer');
    }

    // Mix mode
    const mixQ = BakeryEngine.makeStepQuestion('mix', order, MathEngine, WORD_LEVELS, RaceEngine);
    assert.ok(['math', 'reading'].includes(mixQ.category));
  });

  it('renderKitchenSvg progressively renders base, frosting, and topping layers across stages 0..3', () => {
    const order = BakeryEngine.pickOrder(1, 'heartsping', null);

    order.currentStep = 0;
    const svg0 = BakeryEngine.renderKitchenSvg(order);
    assert.ok(svg0.startsWith('<svg') && svg0.includes('cake-layer-empty'));

    order.currentStep = 1;
    const svg1 = BakeryEngine.renderKitchenSvg(order);
    assert.ok(svg1.includes('cake-layer-base'));
    assert.ok(!svg1.includes('cake-layer-frosting'));

    order.currentStep = 2;
    const svg2 = BakeryEngine.renderKitchenSvg(order);
    assert.ok(svg2.includes('cake-layer-base'));
    assert.ok(svg2.includes('cake-layer-frosting'));

    order.currentStep = 3;
    const svg3 = BakeryEngine.renderKitchenSvg(order);
    assert.ok(svg3.includes('cake-layer-toppings'));
  });
});
