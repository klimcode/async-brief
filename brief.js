module.exports = function go(flow, errCb) {
  const isFunction = test => typeof test === 'function';
  const isArray = test => test instanceof Array;
  const lastOf = array => array[array.length - 1];
  const pushNew = levels => levels.push({ functions: [] });


  const stepsArr = [];
  flow.forEach((el) => {
    if (isArray(el)) {
      pushNew(stepsArr);
      lastOf(stepsArr).args = el.concat();
    } else if (isFunction(el)) {
      lastOf(stepsArr).functions.push(el);
    }
  });


  (function run(steps, stepIndex) { // recursive
    if (stepIndex === steps.length) return;
    const lastStep = (stepIndex === steps.length - 1);
    const step = steps[stepIndex];

    if (step.prevStepResults) {
      // console.log(step.prevStepResults);
      step.functions.forEach((func) => {
        if (!isFunction(func)) return;

        let nextStepArgIndex;
        const nextStepIndex = steps.findIndex((nextStep) => {
          nextStepArgIndex = nextStep.args.findIndex(arg => arg === func);
          return (nextStepArgIndex !== -1);
        });
        const arg = step.prevStepResults.length >= 2 ?
          step.prevStepResults :
          step.prevStepResults[0];


        if ((nextStepIndex !== -1) || (nextStepArgIndex !== -1)) {
          steps[nextStepIndex].args[nextStepArgIndex] = new Promise(func.bind(null, arg));
        }
        if (lastStep) {
          func(arg, () => {}, () => {});
        }
      });

      run(steps, stepIndex + 1);
    } else {
      Promise.all(step.args).then((res) => {
        step.prevStepResults = res;
        run(steps, stepIndex);
      })
        .catch(err => errCb && errCb(err));
    }
  }(stepsArr, 0));

  return stepsArr;
};
