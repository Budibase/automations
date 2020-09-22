/**
 * Async worker utility to allow easy chaining of async methods by wrapping every function
 * call in a promise.
 *
 * @param controller the parent object exposing methods to chain
 */
module.exports = function(controller) {
  const worker = this;
  worker.controller = controller;
  worker.promise = new Promise(resolve => resolve());

  worker.do = fn => {
    return (...params) => {
      worker.promise = worker.promise.then(() => {
        return new Promise(async resolve => {
          await fn(...params)
          resolve();
        });
      });
      return worker.controller;
    }
  };
}
