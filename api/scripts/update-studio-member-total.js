const { DB, COLLECTION } = require('../migrations/lib');

module.exports = async () => {
  const data = await DB.collection(COLLECTION.PERFORMER)
    .aggregate([{ $group: { _id: '$studioId', totalPerformer: { $sum: 1 } } }])
    .toArray();

  if (data.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const { _id: studioId, totalPerformer } of data) {
      // eslint-disable-next-line no-await-in-loop
      studioId && await DB.collection(COLLECTION.STUDIO).updateOne(
        {
          _id: studioId
        },
        { $set: { 'stats.totalPerformer': totalPerformer } }
      );
    }
  }
};
