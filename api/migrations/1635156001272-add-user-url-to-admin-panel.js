const { DB, COLLECTION } = require('./lib');

const USER_URL = 'userUrl';
const setting = {
  key: USER_URL,
  value: process.env.USER_URL || '',
  name: 'User URL',
  description: '',
  public: true,
  group: 'general',
  editable: true,
  type: 'text',
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
