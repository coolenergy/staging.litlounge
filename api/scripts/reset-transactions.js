const { DB, COLLECTION } = require('../migrations/lib');

module.exports = async () => {
  await DB.collection(COLLECTION.EARNING).deleteMany({});
  await DB.collection(COLLECTION.PAYMENT_TRANSACTION).deleteMany({});
  await DB.collection(COLLECTION.PAYOUT_REQUEST).deleteMany({});
  await DB.collection(COLLECTION.PURCHASE_ITEM).deleteMany({});
  await DB.collection(COLLECTION.ORDER).deleteMany({});
};
