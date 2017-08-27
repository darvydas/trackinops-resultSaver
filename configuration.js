const development = {
  NODE_ENV: process.env.NODE_ENV,
  NODE_LOG_LEVEL: process.env.NODE_LOG_LEVEL,
  mongodb: {
    host: "localhost",
    port: 27017,
    db: "trackinops",
    uri: "mongodb://localhost:27017/trackinops",
    // username: "",
    // password: "",
    options: {
      useMongoClient: true
    }
  },
  nsq: {
    server: 'nsqd',
    wPort: 4150, // TCP nsqd Write Port, default: 4150
    rPort: 4161, // HTTP nsqlookupd Read Port, default: 4161
    nsqdTCPAddresses: [`nsqd:4150`],
    lookupdHTTPAddresses: ['nsqlookupd:4161'],
    readerOptions: {
      maxInFlight: 1,
      maxBackoffDuration: 128,
      maxAttempts: 0,
      requeueDelay: 90,
      nsqdTCPAddresses: [`nsqd:4150`],
      lookupdHTTPAddresses: ['nsqlookupd:4161'], // HTTP default: '127.0.0.1:4161'
      messageTimeout: 3 * 60 * 1000 // 3 mins
    }
  }
};
const production = {
  mongodb: {
    host: "mongod",
    port: 27017,
    db: "trackinops",
    uri: "mongodb://mongod:27017/trackinops?authSource=admin",
    options: {
      // server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
      // replset: {
      //   ha: true, // Make sure the high availability checks are on, 
      //   haInterval: 5000, // Run every 5 seconds 
      //   socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000, socketTimeoutMS: 90000 }
      // },
      keepAlive: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 90000,
      // reconnectTries: Number.MAX_VALUE,
      config: { autoIndex: false }, // calls ensureIndex on every index in a DB, slower restart, more reliable indexes 
      promiseLibrary: require('bluebird'),
      useMongoClient: true
    }
  },
  nsq: {
    server: 'nsqd',
    wPort: 4150, // TCP nsqd Write Port, default: 4150
    rPort: 4161, // HTTP nsqlookupd Read Port, default: 4161
    nsqdTCPAddresses: [`nsqd:4150`],
    lookupdHTTPAddresses: ['nsqlookupd:4161'],
    readerOptions: {
      clientId: process.env.nsqClientId || '',
      maxInFlight: 5,
      maxBackoffDuration: 128,
      maxAttempts: 0,
      requeueDelay: 90,
      nsqdTCPAddresses: [`nsqd:4150`],
      lookupdHTTPAddresses: ['nsqlookupd:4161'], // HTTP default: '127.0.0.1:4161'
      messageTimeout: 3 * 60 * 1000 // 3 mins
    }
  }

};

module.exports = function (env) {
  if (env === 'production')
    return production;

  if (env === 'test')
    return development;

  if (!env || env === 'dev' || env === 'development')
    return development;
}
