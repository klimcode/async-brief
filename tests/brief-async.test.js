/* eslint-env node, jest */
/* _eslint no-console: "off" */
/* eslint no-unused-vars: "off" */
/* eslint no-multi-spaces: "off" */
const go = require('../brief-async');

let prom;

function bar(x, res, rej) { setTimeout(() => res(x + 1), 10); }
function baz(x, res, rej) { setTimeout(() => res(x + 2), 20); }
function errcb(err) { throw new Error(`errcb catched ${err}`); }


beforeEach(() => {
  const flow = [
    ['foo'],  bar,
    [bar],    baz,
  ];
  prom = go(flow, errcb, true);
});

describe('basic', () => {
  test('should return a promise', () => {
    expect(prom).toBeInstanceOf(Promise);
  });
});
describe('result with milestones', () => {
  test('second milestone is foo1', async () => {
    const res = await prom;
    expect(res[1][0]).toBe('foo1');
  });
  test('final result is foo12', async () => {
    const res = await prom
      .catch((err) => { throw new Error(`catch block catched ${err}`); });
    expect(res[res.length - 1]).toBe('foo12');
  });
});
