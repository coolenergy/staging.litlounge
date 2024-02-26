require('dotenv').config();

const migrate = require('migrate');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

class MongoDbStore {
  async load (fn) {
    let client = null
    let data = null
    try {
      client = await MongoClient.connect(process.env.MONGO_URI)
      const db = client.db()
      data = await db.collection('migrations').find().toArray()
      if (data.length !== 1) {
        // eslint-disable-next-line no-console
        console.log('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.')
        return fn(null, {})
      }
    } finally {
      client.close()
    }
    return fn(null, data[0])
  };

  async save (set, fn) {
    let client = null
    let result = null
    try {
      client = await MongoClient.connect(process.env.MONGO_URI)
      const db = client.db()
      result = await db.collection('migrations')
        .updateOne({}, {
          $set: {
            lastRun: set.lastRun
          },
          $push: {
            migrations: { $each: set.migrations }
          }
        }, { upsert: true })
    } finally {
      client.close()
    }

    return fn(null, result)
  }
}

/**
 * Main application code
 */
migrate.load({
  // Set class as custom stateStore
  stateStore: new MongoDbStore(),
  // do not filter lib folder, load only js file
  filterFunction: (fileName) => fileName.includes('.js') && !fileName.includes('lib/')
}, async function next(err, set) {
  if (err) {
    throw err
  }

  // connect mongoose in the boot then other scripts can use
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
  });

  set.up((err2) => {
    if (err2) {
      throw err2
    }
    // eslint-disable-next-line no-console
    console.log('Migrations successfully ran');
    process.exit();
  })
})