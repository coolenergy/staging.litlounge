const { DB, COLLECTION } = require('./lib');

const MINIMUM_PAYOUT_REQUEST_SETTING_KEY = 'minimumPayoutRequest';
const setting = {
  key: MINIMUM_PAYOUT_REQUEST_SETTING_KEY,
  value: process.env.DEFAULT_MINIMUM_PAYOUT_REQUEST || 0,
  name: 'Min Payout Request',
  description: '',
  public: true,
  group: 'general',
  editable: true,
  type: 'number',
  meta: {
    min: 0,
    step: 1
  },
  visible: true
}

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate Min Payout Request');

  // eslint-disable-next-line no-await-in-loop
  const checkKey = await DB.collection(COLLECTION.SETTING).findOne({
    key: setting.key
  });
  if (!checkKey) {
    // eslint-disable-next-line no-await-in-loop
    await DB.collection(COLLECTION.SETTING).insertOne({
      ...setting,
      type: setting.type || 'text',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    // eslint-disable-next-line no-console
    console.log(`Inserted setting: ${setting.key}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Setting: ${setting.key} exists`);
  }
  // eslint-disable-next-line no-console
  console.log('Migrate Min Payout Request done');
  next();
}

module.exports.down = function down(next) {
  next();
}
