/* eslint-env node, jest */
/* _eslint no-console: "off" */
/* eslint no-unused-vars: "off" */
/* eslint no-multi-spaces: "off" */
const go = require('../brief-async');

let milestones;
let prom;

function bar(x, res, rej) { setTimeout(() => res(x + 3), 100); }
function baz(x, res, rej) { setTimeout(() => res(x + 10), 200); }
function errcb(err) { throw new Error(`errcb catched ${err}`); }
function mcb(m) { milestones = m; }


beforeEach(() => {
  const flow = [
    ['foo'],  bar,
    [bar],    baz,
  ];
  prom = go(flow, errcb, mcb);
});

describe('brief-async', () => {
  test('should return a promise', () => {
    expect(prom).toBeInstanceOf(Promise);
  });
  test('milestone is foo3', async () => {
    const res = await prom;
    expect(milestones[1][0]).toBe('foo3');
  });
  test('result is foo310', async () => {
    const res = await prom
      .catch((err) => { throw new Error(`catch block catched ${err}`); });
    expect(res).toBe('foo310');
  });
});
