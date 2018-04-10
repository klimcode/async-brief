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
    const errCb = errorCallback
      ? (err) => {
        errorCallback(err);
        resolve(err);
      }
      : reject;


    (function run(stepIndex) { // recursive function mutates STEPS array
      if (stepIndex === STEPS.length) return; // exit from the recursion

      const lastStep = (stepIndex === STEPS.length - 1);
      const step = STEPS[stepIndex];

      if (step.prevStepResults) {
        step.functions.forEach((func) => {
          if (!isFunction(func)) return; // executor is not a function -> ignoring

          let nextStepArgIndex;
          const nextStepIndex = STEPS.findIndex((nextStep) => {
            nextStepArgIndex = nextStep.args.findIndex(arg => arg === func); // closure mutation
            return (nextStepArgIndex !== -1);
          });
          const arg = step.prevStepResults.length >= 2 ?
            step.prevStepResults :
            step.prevStepResults[0];


          if ((nextStepIndex !== -1) || (nextStepArgIndex !== -1)) { // the next executor is found
            STEPS[nextStepIndex].args[nextStepArgIndex] = new Promise(func.bind(null, arg));
          }
          if (lastStep) {
            func(arg, resCb, errCb);
          }
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
