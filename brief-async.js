module.exports = function go(input, errorCallback, isMilestones) {
  const isFunction = test => typeof test === 'function';
  const isArray = test => test instanceof Array;
  const lastOf = array => array[array.length - 1];
  const pushNew = array => array.push({ functions: [] });
  const convert = (array) => {
    const result = [];
    array.forEach((el) => {
      if (isArray(el)) {
        pushNew(result);
        lastOf(result).args = el.concat();
      } else if (isFunction(el)) {
        lastOf(result).functions.push(el);
      } else {
        throw new TypeError('an element must be an array or a function');
      }
    });
    return result;
  };


  return new Promise((resolve, reject) => {
    const STEPS = convert(input);
    const resCb = (res) => {
      let result = res;
      if (isMilestones) {
        result = STEPS.map(st => st.prevStepResults);
        result.push(res);
      }
      resolve(result);
    };
    const errCb = (err) => {
      if (errorCallback) errorCallback(err);
      reject(err);
    };


    (function run(stepIndex) { // recursive function mutates STEPS array
      if (stepIndex === STEPS.length) return; // exit from the recursion

      const lastStep = (stepIndex === STEPS.length - 1);
      const step = STEPS[stepIndex];

      if (step.prevStepResults) {
        step.functions.forEach((func) => {
          if (!isFunction(func)) return; // executor is not a function -> ignoring

          let nextStepArgIndex;
          const argIndex = STEPS.findIndex((nextStep) => {
            nextStepArgIndex = nextStep.args.findIndex(arg => arg === func); // closure mutation
            return (nextStepArgIndex !== -1);
          });
          const prevResults = step.prevStepResults;

          if ((argIndex !== -1) || (nextStepArgIndex !== -1)) { // func is a dependency of smth.
            STEPS[argIndex].args[nextStepArgIndex] = new Promise(func.bind(null, prevResults));
          } else if (lastStep) {
            func(prevResults, resCb, errCb); // final
          } else func(prevResults, null, errCb); // dead end. No access to the final resolve cb
        });

        run(stepIndex + 1);
      } else {
        Promise.all(step.args)
          .then((res) => {
            step.prevStepResults = res;
            run(stepIndex);
          })
          .catch(errCb);
      }
    }(0));
  });
};
