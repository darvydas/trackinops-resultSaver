// insert configuration file
const config = require('../../configuration.js')(process.env.NODE_ENV);

// start MongoDB with Mongoose
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird'); // Use bluebird promises
const crawlerModel = require('../models/crawlerModel');
// const executionModel = require('../models/executionModel');
const requestModel = require('../models/requestModel');
mongoose.connect(config.mongodb.uri, config.mongodb.options);

const nsq = require('nsqjs');
// const NSQwriter = new nsq.Writer(config.nsq.server, config.nsq.wPort);
// NSQwriter.connect();
// NSQwriter.on('ready', function () {
//   console.info(`NSQ Writer ready on ${config.nsq.server}:${config.nsq.wPort}`);
// });
// NSQwriter.on('closed', function () {
//   console.info('NSQ Writer closed Event');
// });

const NSQreader = new nsq.Reader(process.env.readTopic || 'trackinops.results.toMongoDB', 'Execute_save', config.nsq.readerOptions);
NSQreader.connect();
NSQreader.on('ready', function () {
  console.info(`NSQ Reader ready on nsqlookupd:${config.nsq.lookupdHTTPAddresses} or ${nsqdTCPAddresses}`);
});
NSQreader.on('error', function (err) {
  if (arguments.length > 1) _.each(arguments, () => console.log)
  console.error(`NSQ Reader error Event`);
  console.error(new Error(err));

  // TODO: should save an error to mongoDB, but there's no message information  

});
NSQreader.on('closed', function () {
  console.info('NSQ Reader closed Event');
});

const _ = require('lodash');
const Promise = require('bluebird');
const URL = require('url');

process.on('SIGINT', function () {
  console.info("\nStarting shutting down from SIGINT (Ctrl-C)");
  // closing NSQwriter and NSQreader connections
  NSQreader.close();
  // NSQwriter.close();

  process.exit(0);
})

// const publishToMongodb = function (method, data) {
//   return new Promise(function (resolve, reject) {
//     NSQwriter.publish(`trackinops.mongodb.${method}`, {
//       method: method,
//       data: data
//     }, function (err) {
//       if (err) {
//         console.error(`NSQwriter Mongo Save publish Error: ${err.message}`);
//         return reject(err);
//       }
//       console.info(`Mongo Save sent to NSQ, 150 chars: ${data.uniqueUrl.substring(0, 150)}`);
//       return resolve();
//     })
//   })
// }

const startResultsSubscriptions = function () {
  NSQreader.on('message',
    function (msg) {
      console.info("Received:", msg.json().data.url);

      return saveToMongo(msg.json().method, msg.json().data)
        .finally((saveResponse) => {
          console.info(`${saveResponse} saved ${msg.json().method} for ${msg.json().data.url}`);
          return msg.finish();
        });
    })
}

function saveToMongo(method, data) {
  // return new Promise((resolve, reject) => {
  if (method === 'requestModel.upsertAfterParser') {
    console.log("method === 'requestModel.upsertAfterParser'");
    return requestModel.upsertAfterParser(data);
  }
  if (method === 'requestModel.upsertAfterError') { return requestModel.upsertAfterError(data); }
  // return Promise.resolve();
  // })
}

exports = module.exports = Queue = {
  startResultsSubscriptions: startResultsSubscriptions
};
