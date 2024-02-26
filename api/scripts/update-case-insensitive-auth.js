const { DB, COLLECTION } = require('../migrations/lib');

module.exports = async () => {
  const items = await DB.collection(COLLECTION.AUTH).find().toArray();
  await items.reduce(async (lastPromise, item) => {
    await lastPromise;

    return DB.collection(COLLECTION.AUTH).updateOne({ _id: item._id }, {
      $set: {
        key: item.key.toLowerCase()
      }
    });
  }, Promise.resolve());
}