var Status = {
  PENDING:   0,
  FULFILLED: 1,
  REJECTED:  2
};

var Promise = function(executor) {
  this.status   = Status.PENDING;
  this.value    = null;
  this.handlers = [];

  this.run(executor);
};

Promise.length = 1;

Promise.resolve = function(value) {
  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(e) {
  return new Promise(function(resolve, reject) {
    reject(e);
  });
};

Promise.all = function(values) {
  var promises = [];
  values.forEach(function(value) {
    if (value instanceof Promise) {
      promises.push(value);
    } else {
      promises.push(Promise.resolve(value));
    }
  });
  return new Promise(function(resolve, reject) {
    var l = promises.length;
    if (l === 0) {
      resolve();
      return [];
    }
    var settled = false;
    var count = 0;
    var values = new Array(l); // index -> resolved value
    var onFulfilled = function(value, index) {
      if (settled) {
        return;
      }
      count++;
      values[index] = value;
      if (count >= l) {
        settled = true;
        resolve(values);
      }
    };
    var onRejected = function(reason) {
      if (settled) {
        return;
      }
      settled = true;
      reject(reason);
    };
    for (var i = 0; i < l; i++) {
      promises[i].then(function(index) {
        return function(value) {
          onFulfilled(value, index);
        };
      }(i), onRejected);
    }
  });
};

Promise.race = function(values) {
  var promises = [];
  values.forEach(function(value) {
    if (value instanceof Promise) {
      promises.push(value);
    } else {
      promises.push(Promise.resolve(value));
    }
  });
  return new Promise(function(resolve, reject) {
    var l = promises.length;
    if (l === 0) {
      resolve();
      return [];
    }
    var settled = false;
    var onSettled = function(value, callback) {
      if (settled) {
        return;
      }
      settled = true;
      callback(value);
    };
    var onFulfilled = function(value) {
      onSettled(value, resolve);
    };
    var onRejected = function(reason) {
      onSettled(reason, reject);
    };
    for (var i = 0; i < l; i++) {
      promises[i].then(onFulfilled, onRejected);
    }
  });
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  var self = this;
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      self.enqueueOrExecuteHandler(function(value) {
        try {
          if (value instanceof Promise) {
            return resolve(value.then(onFulfilled, onRejected));
          } else if (!onFulfilled) {
            return resolve(value);
          } else {
            return resolve(onFulfilled(value));
          }
        } catch (ex) {
          return reject(ex);
        }
      }, function(e) {
        if (!onRejected) {
          reject(e);
          return;
        }
        try {
          resolve(onRejected(e));
        } catch (error) {
          reject(error);
        }
      });
    }, 0);
  });
};

Promise.prototype.enqueueOrExecuteHandler = function(onFulfilled, onRejected) {
  if (this.status === Status.PENDING) {
    this.handlers.push({
      onFulfilled: onFulfilled,
      onRejected:  onRejected
    });
  } else {
    if (this.status === Status.FULFILLED) {
      onFulfilled(this.value);
    }
    if (this.status === Status.REJECTED) {
      onRejected(this.value);
    }
  }
};

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.rescue = Promise.prototype['catch'];

Promise.prototype.fulfill = function(value) {
  var self    = this;
  this.status = Status.FULFILLED;
  this.value  = value;
  this.handlers.forEach(function(handler) {
    handler.onFulfilled(self.value);
  });
  this.handlers = [];
};

Promise.prototype.reject = function(reason) {
  var self    = this;
  this.status = Status.REJECTED;
  this.value  = reason;

  this.handlers.forEach(function(handler) {
    handler.onRejected(self.value);
  });
  this.handlers = [];
};

Promise.prototype.run = function(executor) {
  var self = this;
  try {
    executor(function(value) {
      self.fulfill(value);
    }, function(e) {
      self.reject(e);
    });
  } catch (e) {
    self.reject(e);
  }
};

Promise.Status = Status;
module.exports = Promise;
