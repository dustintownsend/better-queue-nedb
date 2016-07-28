# Better Queue Nedb Store

[![npm package](https://nodei.co/npm/better-queue-nedb.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/better-queue-nedb/)

[![Build status](https://img.shields.io/travis/dustintownsend/better-queue-nedb.svg?style=flat-square)](https://travis-ci.org/dustintownsend/better-queue-nedb)
[![Dependency Status](https://img.shields.io/david/dustintownsend/better-queue-nedb.svg?style=flat-square)](https://david-dm.org/dustintownsend/better-queue-nedb)
[![Known Vulnerabilities](https://snyk.io/test/npm/better-queue-nedb/badge.svg?style=flat-square)](https://snyk.io/test/npm/better-queue-nedb)

## Work in progress
This is a custom [Nedb](https://github.com/louischatriot/nedb) store for [Better Queue](https://github.com/diamondio/better-queue)

---

#### Install (via npm)

```bash
npm install --save better-queue
npm install --save better-queue-nedb
```

#### Quick Example

```js
var Queue = require('better-queue');
var BetterQueueNedb = require('better-queue-nedb');
var store = new BetterQueueNedb('./queue-database.nedb').queueStore;

var q = new Queue(function (input, cb) {
  
  // Some processing here ...

  cb(null, result);
})

// pass the nedb store to better queue.
q.use(store);

q.push(1)
q.push({ x: 1 })
```

#### Issues

Currently failing ~~7~~ 5 test from better queue.

1. ~~Basic Queue should run filo~~
2. ~~Basic Queue should concurrently handle tasks~~
3. Basic Queue should timeout and fail
4. Basic Queue should cancel while running and in queue
5. Basic Queue should respect batchDelayTimeout
6. Basic Queue merge batches should call all push callbacks
7. Basic Queue cancel should not retry

I've also seen the "should run fifo" and "should prioritize" test fail. 
