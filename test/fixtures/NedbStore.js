var fs = require('fs-extra');
var NedbStore = require('../../lib/stores/NedbStore');

function MockNedbStore(databasePath) {
  NedbStore.call(this, databasePath);

  this.queueStore.close = function (cb) {
    var after = function () {
      return cb();
    }
    if (!this.datastore.filename) return after();
    fs.unlink(this.datastore.filename, function (err) {
      after();
    });
  }
}

module.exports = MockNedbStore;
