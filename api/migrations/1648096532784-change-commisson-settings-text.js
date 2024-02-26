const { DB, COLLECTION } = require('./lib');

module.exports.up = async function up(next) {
  const defaultCommission = await DB.collection(COLLECTION.SETTING).findOne({
    key: 'defaultCommission'
  });
  if (defaultCommission) {
    await DB.collection(COLLECTION.SETTING).updateOne({
      key: 'defaultCommission'
    }, {
      $set: {
        name: 'Commission for Independent Performers (Accepted values - 0 to 100)',
        description: 'This is the default commission % for independent performers. To change performer-level commissions, use the individual commission settings under the Performers menu.'
      }
    });
  }
  const studioCommission = await DB.collection(COLLECTION.SETTING).findOne({
    key: 'studioCommission'
  });
  if (studioCommission) {
    await DB.collection(COLLECTION.SETTING).updateOne({
      key: 'studioCommission'
    }, {
      $set: {
        name: 'Commission for Studios (Accepted values - 0 to 100)',
        description: 'This is the default commission % for studios. To change studio-level commissions, use the individual commission settings under the Studios menu.'
      }
    });
  }
  next()
}

module.exports.down = function down(next) {
  next()
}
