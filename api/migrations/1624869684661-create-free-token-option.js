const { DB, COLLECTION } = require('./lib');

const FREE_TOKENS_SETTING_KEY = 'freeTokens';
const setting = {
  key: FREE_TOKENS_SETTING_KEY,
  value: process.env.DEFAULT_FREE_TOKENS || 0,
  name: 'Free Tokens',
  description: 'Number of token will be added to balance when a new user sign up',
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
  console.log('Create Free Token Option');

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
  console.log('Create Free Token Option done');
  next();
}

module.exports.down = function down(next) {
  next();
}
