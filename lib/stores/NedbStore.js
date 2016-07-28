const uuid = require('node-uuid');
const extend = require('extend');
const path = require('path');
const Datastore = require('nedb');

function NedbStore(databasePath) {
    this.databasePath = databasePath;
    this.datastore = new Datastore({
        filename: this.databasePath,
        autoload: true,
        timestampData: true
    });

    this.queueStore = {
        datastore: this.datastore,
        connect: function (cb) { return connect(this.datastore, cb); },
        getTask: function (taskId, cb) { return getTask(this.datastore, taskId, cb); },
        deleteTask: function (taskId, cb) { return deleteTask(this.datastore, taskId, cb); },
        putTask: function (taskId, task, priority, cb) { return putTask(this.datastore, taskId, task, priority, cb); },
        takeFirstN: function (n, cb) { return takeNextN(this.datastore, true, n, cb); },
        takeLastN: function (n, cb) { return takeNextN(this.datastore, false, n, cb); },
        getLock: function (lockId, cb) { return getLock(this.datastore, lockId, cb); },
        getRunningTasks: function (cb) { return getRunningTasks(this.datastore, cb); },
        releaseLock: function (lockId, cb) { return releaseLock(this.datastore, lockId, cb); },
        close: function (cb) { return close(this.datastore, cb); }
    }
}

module.exports = NedbStore;

var connect = function (datastore, cb) {
    datastore.count({ lock: '' }, function (err, count) {
        return cb(err, count);
    });
}

var getTask = function (datastore, taskId, cb) {
    return datastore.findOne({ _id: taskId, lock: '' }, cb);
}

var deleteTask = function (datastore, taskId, cb) {
    datastore.findOne({ _id: taskId }, function (err, task) {
        if (err) return cb(err);
        datastore.remove({ _id: taskId }, {}, function (err, numRemoved) {
            return cb(err);
        });
    });
}

var putTask = function (datastore, taskId, task, priority, cb) {
    datastore.findOne({ _id: taskId }, function (err, foundTask) {
        if (err) return cb(err);
        if (foundTask) {
            // update
            datastore.update({
                _id: taskId
            }, {
                    task: task,
                    priority: priority || 0,
                    lock: ''
                }, function (err, newTask) {
                    if (err) console.log('error updating task', err);
                    return cb(err);
                });
        } else {
            // insert
            datastore.insert({
                _id: taskId,
                task: task,
                priority: priority || 0,
                lock: ''
            }, function (err, newTask) {
                if (err) console.log('error inserting task', err);
                return cb(err);
            });
        }
    });
}

var takeNextN = function (datastore, first, n, cb) {
    var sort = {};
    sort.priority = -1;
    sort.createdAt = first ? 1 : -1;

    datastore.find({ $or: [{ lock: { $exists: true } }, { lock: '' }] }).sort(sort).limit(n).exec(function (err, results) {

        if (err) { console.log('takeNextN find error', err); return cb(err); }
        if (!results) return cb();

        var count = 0;
        var lockId = uuid.v4();
        results.forEach(function (res) {
            datastore.update({ _id: res._id }, { $set: { lock: lockId } }, {}, function (err, numAffected, affectedDocs) {
                if (err) { console.log('takeNextN update error', err); return cb(err); }
                count++;

                if (count === results.length) {
                    return cb(null, lockId);
                }
            });
        });
    })
}

var getLock = function (datastore, lockId, cb) {
    datastore.find({ lock: lockId }, function (err, results) {
        var tasks = {};
        results.forEach(function (row) {
            tasks[row._id] = row.task;
        });
        return cb(err, tasks);
    });
}

var getRunningTasks = function (datastore, cb) {
    datastore.find({ $not: { lock: '' } }, function (err, results) {
        var tasks = {};
        results.forEach(function (row) {
            tasks[row.lock] = tasks[row.lock] || [];
            tasks[row.lock][row._id] = row.task;
        });
        return cb(err, tasks);
    });
}

var releaseLock = function (datastore, lockId, cb) {
    datastore.remove({ lock: lockId }, { multi: true }, function (err, numRemoved) {
        return cb(err);
    });
}

var close = function (datastore, cb) {
    cb();
}
