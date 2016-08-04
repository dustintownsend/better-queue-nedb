var test = require('better-queue-store-test');
var fs = require('fs-extra');
var NedbStore = require('../lib/stores/NedbStore');

var databasePath = '';
var count = 0;
function store() {
    fs.ensureDirSync('tmp/');
    count += 1;
    databasePath = 'tmp/' + count + '.nedb';
    return new NedbStore(databasePath).queueStore;
}

test.basic('Nedb Store Test', {
    create: function (cb) {
        // Prepare your store here ...
        cb(null, store());
    },

    destroy: function (cb) {
        // Optionally, you can clean up after your store
        fs.unlink(databasePath, function (err) {
            if (err) {
                setTimeout(function () {
                    fs.unlinkSync(databasePath);
                    return cb();
                }, 500);
            }
            else {
                return cb();
            }
        });
    }

});