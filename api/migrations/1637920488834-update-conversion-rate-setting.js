const { DB, COLLECTION } = require('./lib');

module.exports.up = function up(next) {
  DB.collection(COLLECTION.SETTING).updateOne(
    {
      key: 'conversionRate'
    },
    {
      $set: {
        public: true
      }
    }
  );
  next();
};

module.exports.down = function down(next) {
  next();
};
