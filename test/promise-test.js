var assert     = require('assert');
var Promise    = require('../');
var TestHelper = require('./test-helper');

describe('Promise', function() {
  describe('#then', function() {
    context('when fulfilled synchronously', function() {
      it('should call fulfilled callback', function(done) {
        new Promise(function(resolve) {
          resolve('value');
        }).then(function(value) {
          assert.equal(value, 'value');
          done();
        }, function() {
          assert.fail();
        });
      });

      it('should be ok with no fulfilled callback', function(done) {
        new Promise(function(resolve) {
          resolve('value');
        }).then(null, function() {
          assert.fail();
        }).then(function(value) {
          assert.equal(value, 'value');
          done();
        }, function() {
          assert.fail();
        });
      });

      it('should call fulfilled callback only one time', function(done) {
        var count = 0;
        new Promise(function(resolve, reject) {
          resolve('value1');
          resolve('value2');
          reject('reason');
        }).then(function(value) {
          count += 1;
          assert.equal(value, 'value1');
          assert.equal(count, 1);
        }, function() {
          assert.fail();
        });
        setTimeout(function() {
          done();
        }, 100);
      });
    });

    context('when rejected', function() {
      it('should add rejected callback', function(done) {
        new Promise(function(resolve, reject) {
          reject('reason');
        }).then(function() {
          assert.fail();
        }, function(reason) {
          assert.equal(reason, 'reason');
          done();
        });
      });

      it('should call rejected callback only one time', function(done) {
        var count = 0;
        new Promise(function(resolve, reject) {
          reject('reason1');
          reject('reason2');
          resolve('value');
        }).then(function() {
          assert.fail();
        }, function(reason) {
          count += 1;
          assert.equal(reason, 'reason1');
          assert.equal(count, 1);
        });
        setTimeout(function() {
          done();
        }, 100);
      });
    });

    context('when fulfilled asynchronously', function() {
      it('should call fulfilled callback ', function(done) {
        new Promise(function(resolve) {
          setTimeout(function() {
            resolve('value');
          }, 100);
        }).then(function(value) {
          assert.equal(value, 'value');
          done();
        }, function() {
          assert.fail();
        });
      });
    });

    context('chained', function() {
      it('should be chained with promise ', function(done) {
        new Promise(function(resolve) {
          setTimeout(function() {
            resolve('value');
          }, 100);
        }).then(function(value) {
          return new Promise(function(resolve) {
            setTimeout(function() {
              resolve(value + ' chained');
            }, 100);
          });
        }).then(function(value) {
          assert.equal(value, 'value chained');
          done();
        }, function() {
          assert.fail();
        });
      });

      it('should call rejected callback ', function(done) {
        new Promise(function(resolve) {
          resolve('value');
        }).then(function() {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              reject('chained reason');
            }, 100);
          });
        }).then(function() {
          assert.fail();
        }, function(reason) {
          assert.equal('chained reason', reason);
          done();
        });
      });
    });
  });

  describe('#catch', function() {
    it('should add rejected callback', function(done) {
      new Promise(function(resolve, reject) {
        reject('reason');
      }).catch(function(reason) {
        assert.equal(reason, 'reason');
        done();
      });
    });

    it('should recover from rejection', function(done) {
      new Promise(function(resolve, reject) {
        reject('reason');
      }).catch(function() {
        return 'recovered';
      }).then(function(value) {
        assert.equal('recovered', value);
        done();
      });
    });

    it('should catch throwed exception', function(done) {
      new Promise(function(resolve) {
        resolve('value');
      }).then(function() {
        throw new Error('throwed');
      }).catch(function(e) {
        assert.equal('throwed', e.message);
        done();
      });
    });

    it('should catch throwed exception in executor', function(done) {
      new Promise(function() {
        throw new Error('first throwed');
      }).then(function() {
        assert.fail();
      }).catch(function(e) {
        assert.equal('first throwed', e.message);
        done();
      });
    });

    it('should catch throwed exception in fulfilled callback', function(done) {
      new Promise(function(resolve) {
        resolve('value');
      }).then(function() {
        throw new Error('second throwed');
      }, function() {
        assert.fail();
      }).catch(function(e) {
        assert.equal('second throwed', e.message);
        done();
      });
    });

    it('should catch throwed exception in rejected callback', function(done) {
      new Promise(function() {
        throw new Error('first throwed');
      }).then(function() {
        assert.fail();
      }, function() {
        throw new Error('second throwed');
      }).catch(function(e) {
        assert.equal('second throwed', e.message);
        done();
      });
    });
  });

  describe('.resolve', function(done) {
    it('should return promise that resolves immediately', function() {
      Promise.resolve('value').then(function() {
        done();
      });
    });
  });

  describe('.reject', function() {
    it('should return promise that rejects immediately', function(done) {
      Promise.reject(new Error('error')).catch(function(e) {
        assert.equal(e.message, 'error');
        done();
      });
    });
  });

  describe('.all', function() {
    it('should return a promise that fulfills when all of the promises have fulfilled', function(done) {
      var finished = false;
      var promises = [
        TestHelper.resolveAfter('value0',   0),
        TestHelper.resolveAfter('value1',  10),
        TestHelper.resolveAfter('value2',  20),
        TestHelper.resolveAfter('value3',  50),
        TestHelper.resolveAfter('value4', 100),
      ];
      Promise.all(promises).then(function(values) {
        assert.equal(values.length, 5);
        assert.equal(values[0]    , 'value0');
        assert.equal(values[1]    , 'value1');
        assert.equal(values[2]    , 'value2');
        assert.equal(values[3]    , 'value3');
        assert.equal(values[4]    , 'value4');
        finished = true;
      }, function() {
        assert.fail();
      });
      setTimeout(function() {
        assert(finished);
        done();
      }, 120);
    });

    it('should return a promise that rejects as soon as one of the promises rejects', function(done) {
      var finished = false;
      var promises = [
        TestHelper.resolveAfter('value0',   0),
        TestHelper.rejectAfter('reason1',  10),
        TestHelper.resolveAfter('value2',  20),
        TestHelper.resolveAfter('value3',  50),
        TestHelper.rejectAfter('reason4', 100),
      ];
      Promise.all(promises).then(function() {
        assert.fail();
      }, function(reason) {
        assert.equal(reason, 'reason1');
        finished = true;
      });
      setTimeout(function() {
        assert(finished);
        done();
      }, 120);
    });
  });

  describe('.race', function() {
    it('should return a promise that fulfills as soon as one of the promises fulfills', function(done) {
      var finished = false;
      var promises = [
        TestHelper.resolveAfter('value0',   0),
        TestHelper.resolveAfter('value1',  10),
        TestHelper.rejectAfter('reason2',  20),
      ];
      Promise.race(promises).then(function(value) {
        assert.equal(value, 'value0');
        finished = true;
      }, function() {
        assert.fail();
      });
      setTimeout(function() {
        assert(finished);
        done();
      }, 30);
    });

    it('should return a promise that rejects as soon as one of the promises rejects', function(done) {
      var finished = false;
      var promises = [
        TestHelper.rejectAfter('reason0',   0),
        TestHelper.resolveAfter('value1',  10),
        TestHelper.rejectAfter('reason0',  20),
      ];
      Promise.race(promises).then(function() {
        assert.fail();
      }, function(reason) {
        assert.equal(reason, 'reason0');
        finished = true;
        done();
      });
      setTimeout(function() {
        assert(finished);
        done();
      }, 30);
    });
  });
});
