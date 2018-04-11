/* eslint-env node, jest */
/* _eslint no-console: "off" */
/* eslint no-unused-vars: "off" */
/* eslint no-multi-spaces: "off" */
/* eslint no-empty: "off" */
/* eslint no-console: "off" */
const go = require('../brief-async');

let prom;
let ERR;

function foo(x, res, rej) { setTimeout(() => res(`${x}-foo`), 5); }
function bar(x, res, rej) { setTimeout(() => res(`${x}-bar`), 10); }
function baz(x, res, rej) { setTimeout(() => res(`${x.join('-')}-baz`), 20); }
function fnx(x, res, rej) { setTimeout(() => res(`${x}-x`), 100); }
function fin(x, res, rej) { setTimeout(() => res(`${x.join('-')}-final`), 30); }


const flow = [
  ['start'],  foo, bar, fnx,
  [foo, bar], baz,
  [baz, fnx, 'z'], fin,
];

describe('basic', () => {
  test('"go" returns a promise', () => {
    prom = go(flow);
    expect(prom).toBeInstanceOf(Promise);
  });
});
describe('results', () => {
  test('final result', async () => {
    prom = go(flow, null, false);
    const res = await prom;
    expect(res).toBe('start-foo-start-bar-baz-start-x-z-final');
  });
  test('second milestone contains start-bar', async () => {
    prom = go(flow, null, true);
    const res = await prom;
    console.log(res);
    expect(res[1][1]).toBe('start-bar');
  });
});
describe('rejections', () => {
  function barRej(x, res, rej) { setTimeout(() => rej(`${x}-barReject`), 20); }
  const flowRej = [
    ['start'],  foo, barRej, fnx,
    [foo, barRej], baz,
    [baz, fnx], fin,
  ];


  test('reject in a dead end', async () => {
    function deadEnd(x, res, rej) { setTimeout(() => rej('dead end'), 3); }
    const flowDead = [
      ['start'],  foo, barRej, fnx, deadEnd,
      [foo, barRej], baz,
      [baz, fnx], fin,
    ];

    prom = go(flowDead);
    try {
      await prom;
    } catch (e) {
      ERR = `${e} handled by catch`;
    }
    expect(ERR).toBe('dead end handled by catch');
  });
  test('reject handled by catch', async () => {
    prom = go(flowRej);
    try {
      await prom;
    } catch (e) {
      ERR = `${e} handled by catch`;
    }
    expect(ERR).toBe('start-barReject handled by catch');
  });
  test('reject handled by a callback', async () => {
    function errcb(err) { ERR = `${err} handled by a callback`; }

    prom = go(flowRej, errcb);
    try {
      await prom;
    } catch (e) {}

    expect(ERR).toBe('start-barReject handled by a callback');
  });
});
