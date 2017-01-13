var assert     = require('assert');
var Promise    = require('../');
var TestHelper = require('./test-helper');

describe('Promise', function() {
  describe('#then', function() {
    context('when fulfilled synchronously', function() {
      it('should call fulfilled callback', function(done) {
        new Promise(function(resolve, reject) {
          resolve('result');
        }).then(function(value) {
          assert.equal('result', value);
          done();
        }, function(e) {
          assert.fail();
        });
      });

      it('should be ok with no fulfilled callback', function(done) {
        var promise = new Promise(function(resolve, reject) {
          resolve('result');
        }).then(null, function(e) {
          assert.fail();
        }).then(function(value) {
          assert.equal('result', value);
          done();
        }, function() {
          assert.fail();
        });
      });
    });

    context('when rejected', function() {
      it('should add rejected callback', function(done) {
        new Promise(function(resolve, reject) {
          reject(new Error('error'));
        }).then(function(value) {
          assert.fail();
        }, function(e) {
          assert.equal('error', e.message);
          done();
        });
      });
    });

    context('when fulfilled asynchronously', function() {
      it('should call fulfilled callback ', function(done) {
        new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve('result');
          }, 100);
        }).then(function(value) {
          assert.equal('result', value);
          done();
        }, function(e) {
          assert.fail();
        });
      });
    });

    context('chained', function() {
      it('should be chained with promise ', function(done) {
        new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve('result');
          }, 100);
        }).then(function(value) {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              resolve(value + ' chained');
            }, 100);
          });
        }).then(function(value) {
          assert.equal('result chained', value);
          done();
        }, function(e) {
          assert.fail();
        });
      });

      it('should call rejected callback ', function(done) {
        new Promise(function(resolve, reject) {
          resolve('result');
        }).then(function(value) {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              reject(new Error('chained error'));
            }, 100);
          });
        }).then(function() {
          assert.fail();
        }, function(e) {
          assert.equal(e.message, 'chained error');
          done();
        });
      });
    });
  });

  describe('#catch', function() {
    it('should add rejected callback', function(done) {
      new Promise(function(resolve, reject) {
        reject(new Error('error'));
      }).catch(function(e) {
        assert.equal('error', e.message);
        done();
      });
    });

    it('should recover from rejection', function(done) {
      new Promise(function(resolve, reject) {
        reject(new Error('error'));
      }).catch(function(e) {
        return 'recovered';
      }).then(function(value) {
        assert.equal(value, 'recovered');
        done();
      });
    });

    it('should catch throwed exception', function(done) {
      new Promise(function(resolve, reject) {
        resolve('result');
      }).then(function(e) {
        throw new Error('throwed');
      }).catch(function(e) {
        assert.equal(e.message, 'throwed');
        done();
      });
    });

    it('should catch throwed exception in executor', function(done) {
      new Promise(function(resolve, reject) {
        throw new Error('first throwed');
      }).then(function(e) {
        assert.fail();
      }).catch(function(e) {
        assert.equal(e.message, 'first throwed');
        done();
      });
    });

    it('should catch throwed exception in fulfilled callback', function(done) {
      new Promise(function(resolve, reject) {
        resolve('result');
      }).then(function(e) {
        throw new Error('second throwed');
      }, function() {
        assert.fail();
      }).catch(function(e) {
        assert.equal(e.message, 'second throwed');
        done();
      });
    });

    it('should catch throwed exception in rejected callback', function(done) {
      new Promise(function(resolve, reject) {
        throw new Error('first throwed');
      }).then(function(e) {
        assert.fail();
      }, function() {
        throw new Error('second throwed');
      }).catch(function(e) {
        assert.equal(e.message, 'second throwed');
        done();
      });
    });
  });

  describe('.resolve', function(done) {
    it('should return promise that resolves immediately', function() {
      Promise.resolve('result').then(function() {
        done();
      });
    });
  });

  describe('.reject', function() {
    it('should return promise that rejects immediately', function(done) {
      Promise.reject(new Error('error')).catch(function(e) {
        assert.equal('error', e.message);
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
        assert.equal(       5, values.length);
        assert.equal('value0', values[0]    );
        assert.equal('value1', values[1]    );
        assert.equal('value2', values[2]    );
        assert.equal('value3', values[3]    );
        assert.equal('value4', values[4]    );
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
      Promise.all(promises).then(function(values) {
        assert.fail();
      }, function(reason) {
        assert.equal('reason1', reason);
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
        assert.equal('value0', value);
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
        assert.equal('reason0', reason);
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
