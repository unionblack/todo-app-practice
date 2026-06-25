/* if require fn is available, it means we are in Node.js Land i.e. testing! */
/* istanbul ignore next */
if (typeof require !== 'undefined' && this.window !== this) {
  // Для тестов нам пока понадобится только это
}

var initial_model = {
  todos: [],
  hash: "#/"
}

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    model: initial_model
  }
}