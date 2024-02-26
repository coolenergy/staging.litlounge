const { DB, COLLECTION } = require('./lib');

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Change settings text');
  await DB.collection(COLLECTION.SETTING).updateOne({ key: 'defaultOfflineModelImage' }, {
    $set: {
      name: 'Default Image When Model Is not Streaming',
      description: 'Default Image When Model Is not Streaming' 
    }
  });


  next();
}

module.exports.down = function down(next) {
  next();
}
