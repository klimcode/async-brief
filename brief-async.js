module.exports = function go(input, errorCallback, milestonesCb) {
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
    const errCb = errorCallback || reject;
    const STEPS = convert(input);


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
            if (milestonesCb) milestonesCb(STEPS.map(st => st.prevStepResults));
            func(arg, resolve, errCb);
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

// function bar(x, res, rej) { setTimeout(() => rej(x + 3), 100); }
// function errcb(err) { console.log('cb catched', err); }
// module.exports([['foo'], bar]).catch((err) => { console.log('catch catched', err); });
