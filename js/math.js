/* Math engine: randomly generates addition/subtraction problems with up to 4-digit numbers
   and kid-friendly, column-by-column hint steps.
   Works in the browser (window.MathEngine) and in Node (module.exports) for tests. */
(function (root) {
  'use strict';

  const PLACES = ['ones', 'tens', 'hundreds', 'thousands'];
  const MAX_ANSWER = 9999;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Digits of n, ones first: 352 -> [2, 5, 3]
  function digitsOf(n) {
    return String(n).split('').reverse().map(Number);
  }

  // How many columns need carrying (add) or borrowing (sub)?
  function regroupCount(op, a, b) {
    const A = digitsOf(a), B = digitsOf(b);
    let count = 0, extra = 0;
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      const x = A[i] || 0, y = B[i] || 0;
      if (op === 'add') {
        extra = x + y + extra >= 10 ? 1 : 0;
      } else {
        extra = x - extra < y ? 1 : 0;
      }
      count += extra;
    }
    return count;
  }

  function needsRegroup(op, a, b) {
    return regroupCount(op, a, b) > 0;
  }

  // Both numbers have `digits` digits, answer between 1 and 10^digits - 1 (never larger than 4-digit numbers).
  function isValid(op, a, b, regroup, digits = 2) {
    const min = digits === 1 ? 1 : 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    if (a < min || a > max || b < min || b > max) return false;
    if (op === 'add' && a + b > max) return false;
    if (op === 'sub' && a - b < 1) return false;
    return needsRegroup(op, a, b) === regroup;
  }

  function makeProblem(op, regroup, digits = 2) {
    // A single column can never borrow, so 1-digit subtraction is always "no regroup".
    if (op === 'sub' && digits === 1) regroup = false;
    const min = digits === 1 ? 1 : 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    let a, b;
    do {
      a = rand(min, max);
      b = rand(min, max);
      if (op === 'sub' && b > a) [a, b] = [b, a];
    } while (!isValid(op, a, b, regroup, digits));
    return { op, a, b, answer: op === 'add' ? a + b : a - b, regroup, digits };
  }

  // planet: { ops: ['add'|'sub'...], regroup: true | false | 'mixed', digits: 1-4 }
  function makeMission(planet, count) {
    const seen = new Set();
    const list = [];
    while (list.length < count) {
      const op = planet.ops[Math.floor(Math.random() * planet.ops.length)];
      const regroup = planet.regroup === 'mixed' ? Math.random() < 0.5 : planet.regroup;
      const p = makeProblem(op, regroup, planet.digits || 2);
      const key = p.op + p.a + ',' + p.b;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(p);
      }
    }
    return list;
  }

  // Number of answer boxes to show in the column layout.
  function answerWidth(p) {
    return Math.max(String(p.a).length, String(p.b).length, String(p.answer).length);
  }

  // Column-method steps: ones first, then tens, hundreds, thousands.
  // The last "= N" in each step is the digit written in that column
  // (the final addition column may write a two-digit number).
  function hintSteps(p) {
    const A = digitsOf(p.a), B = digitsOf(p.b);
    const cols = Math.max(A.length, B.length);
    const steps = [];
    let extra = 0; // carry (add) or borrow (sub)

    for (let i = 0; i < cols; i++) {
      const place = PLACES[i];
      const next = PLACES[i + 1];
      const x = A[i] || 0, y = B[i] || 0;

      if (p.op === 'add') {
        const s = x + y + extra;
        const sum = `Add the ${place}: ${x} + ${y}${extra ? ' + 1' : ''} = ${s}.`;
        if (s >= 10 && i < cols - 1) {
          steps.push(`${sum} Write ${s - 10}, carry 1 to the ${next}.`);
          extra = 1;
        } else {
          steps.push(sum);
          extra = 0;
        }
        continue;
      }

      // Subtraction
      let prefix = '';
      let top = x;
      if (extra && x === 0) {
        // Borrowing across a zero: this place trades too, so 10 − 1 = 9.
        prefix = `The ${place} has 0, so trade 1 from the ${next}: 10 − 1 = 9. `;
        top = 9;
        extra = 1;
        steps.push(`${prefix}Take away the ${place}: 9 − ${y} = ${9 - y}.`);
        continue;
      }
      if (extra) {
        top = x - 1;
        prefix = `The ${place} gave 1 away, so ${x} is now ${top}. `;
      }
      if (top < y) {
        steps.push(`${prefix}${top} is smaller than ${y}. Trade 1 from the ${next} for 10 ${place}: ${top + 10} − ${y} = ${top + 10 - y}.`);
        extra = 1;
      } else {
        steps.push(`${prefix}Take away the ${place}: ${top} − ${y} = ${top - y}.`);
        extra = 0;
      }
    }
    return steps;
  }

  // Turn math symbols into words for the speech engine.
  function speakable(text) {
    return text.replace(/\+/g, ' plus ').replace(/−/g, ' minus ').replace(/=/g, ' equals ');
  }

  const api = { PLACES, digitsOf, regroupCount, makeProblem, makeMission, hintSteps, needsRegroup, isValid, answerWidth, speakable };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MathEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
