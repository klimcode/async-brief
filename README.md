# Brief-async

The shortest syntax for defining async flow. It helps to handle difficult cases with many parallel async operations.

## Installation

> **This lib is experimental. Its API may change soon**

```bash
npm i -S brief-async
```

## Example

1. At the start we have a value `'foo'` and want to immediately start 3 functions parallel.
2. Then, after both `fn1` and `fn2` are finished, their results become an argument for `fn4`.
3. Then, after both `fn3` and `fn4` are finished, a `finish` function will start using their results.

```js
// fn1-fn4 and finish functions are declared somethere above.
const flow = require('brief-async');
const steps = [
  ['foo'],      fn1, fn2, fn3,
  [fn1, fn2],   fn4,
  [fn3, fn4],   finish,
];
const result = await flow(steps);
```

## Explanation

The `steps` is just an array. It contains functions and their dependencies.

1. The first element is an array of dependencies which will be resolved and then taken by the second element.
2. The second element must be a function or it will be ignored instead.
3. The third element may be a function or an array.

```js
const steps = [
  // 'foo' is the one argument for fn1-fn3 which work parallel
  ['foo', 123],       fn1, fn2, fn3, deadEnd,
  // f1 and fn2 after resolving pack their results to an array which is the first argument for fn4
  [fn1, fn2, fnArg],  fn4,
  // results of f3 and fn4 become go to finish as an array
  [fn3, fn4],         finish,
];
// result is a Promise
// errHandler is a callback to execute when a reject function is called
// if isMilestones == true, intermediate results will be included to the final result
const result = flow(steps, errHandler, isMilestones);
```

Step handlers or **executors** are functions with 3 arguments:

1. Data from the previous step (array).
2. Resolve callback.
3. Reject callback.

2-nd and 3-rd arguments is needed to finish a Promise. An executor function must call one of those callbacks instead of using `return` statement. The first argument is polymorphic: a value or an array; it depends on the count of dependencies.

**Important**: function `deadEnd` does not have `resolve` function as an argument.
But it has a `reject` function.
So, "dead end" functions may break the whole chain, but they can not resolve the chain.
