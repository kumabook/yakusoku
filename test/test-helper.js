var Promise = require('../');

function resolveAfter(value, after) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(value);
    }, after);
  });
}

function rejectAfter(reason, after) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(reason);
    }, after);
  });
}


module.exports = {
  resolveAfter: resolveAfter,
  rejectAfter:  rejectAfter
};
