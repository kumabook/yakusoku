var Status = {
  Pending:   0,
  Fulfilled: 1,
  Rejected:  2
};

var Promise = function(executor) {
  this.status   = Status.Pending;
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

Promise.prototype.then = function(onFulfilled, onRejected) {
  var self = this;
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      self.enqueueHandler(function(value) {
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
          return resolve(onRejected(e));
        } catch (error) {
          return reject(error);
        }
      });
    }, 0);
  });
};

Promise.prototype.enqueueHandler = function(onFulfilled, onRejected) {
  if (this.status === Status.Pending) {
    this.handlers.push({
      onFulfilled: onFulfilled,
      onRejected:  onRejected
    });
  } else {
    if (this.status === Status.Fulfilled) {
      onFulfilled(this.value);
    }
    if (this.status === Status.Rejected) {
      onRejected(this.value);
    }
  }
};

Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.fulfill = function(value) {
  var self    = this;
  this.status = Status.Fulfilled;
  this.value  = value;
  this.handlers.forEach(function(handler) {
    handler.onFulfilled(self.value);
  });
  this.handlers = null;
};

Promise.prototype.reject = function(reason) {
  var self    = this;
  this.status = Status.Rejected;
  this.value  = reason;

  this.handlers.forEach(function(handler) {
    handler.onRejected(self.value);
  });
  this.handlers = null;
};

Promise.prototype.run = function(executor) {
  var self = this;
  try {
    executor(function(value) {
      if (self.status === Status.Pending) {
        self.fulfill(value);
      }
    }, function(e) {
      if (self.status === Status.Pending) {
        self.reject(e);
      }
    });
  } catch (e) {
    if (self.status === Status.Pending) {
      self.reject(e);
    }
  }
};

module.exports        = Promise;
module.exports.Status = Status;
