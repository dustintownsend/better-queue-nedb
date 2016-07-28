var async = require('async');
var mockery = require('mockery');
mockery.enable({ warnOnReplace: false, warnOnUnregistered: false });
mockery.registerMock('../lib/stores/NedbStore', require('../fixtures/NedbStore'));

exports.destroyQueues = function (done) {
  async.each([this.q, this.q1, this.q2], function (q, qCB) {
    if (!q) return qCB();
    setTimeout(function () {
      q.destroy(qCB);
    }, 15);
  }, function (err) {
    if (err) console.error(err);
    done();
  });
};
