# Brief-async

The shortest syntax for defining async flow. It helps to handle difficult cases with many parallel async operations.

## Installation

```bash
npm i -S brief-async
```

## Example

1. At the start we have a value `'foo'` and want to immediately start 3 functions parallel.
2. Then, after both `fn1` and `fn2` are finished, their results become an argument for `fn4`.
3. Then, after both `fn3` and `fn4` are finished, a `finish` function will start using their results.

```js
// fn1-fn4 and finish functions are declared somethere above.
const flow = require('brief-async')
const steps = [
  ['foo'],      fn1, fn2, fn3,
  [fn1, fn2],   fn4,
  [fn3, fn4],   finish,
];
const result = await flow(steps);
```

## Explanation

The `steps` is just an array. It contains functions and their dependencies.

1. The element is an array of dependencies which will be resolved and then taken by the second element.
2. The second element must be a function or it will be ignored instead.
3. The third element may be a function or an array.

```js
const result = flow(steps, errHandler, getMilestones);
// result is a Promise
// errHandler is a callback to execute when a reject function is called
// getMilestones is a callback where the single argument is an array of intermediate results
```
