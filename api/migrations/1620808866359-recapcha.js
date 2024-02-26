const { DB, COLLECTION } = require('./lib');

const GOOGLE_RECAPTCHA_ENABLED_KEY = 'googleReCaptchaEnabled';
const GOOGLE_RECAPTCHA_SITE_KEY = 'googleReCaptchaSiteKey';
const GOOGLE_RECAPTCHA_SECRET_KEY = 'googleReCaptchaSecretKey';

const settings = [
  {
    key: GOOGLE_RECAPTCHA_ENABLED_KEY,
    value: false,
    name: 'Enable recaptcha',
    description:
      'Enable if you want recaptcha in login page',
    type: 'boolean',
    public: true,
    group: 'general',
    editable: true,
    visible: true
  },
  {
  key: GOOGLE_RECAPTCHA_SITE_KEY,
  value: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  name: 'Google Re-captcha site key',
  description: 'Google Re-captcha v2 site key',
  public: true,
  group: 'general',
  editable: true,
  type: 'text'
},
{
  key: GOOGLE_RECAPTCHA_SECRET_KEY,
  value: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
  name: 'Google Re-captcha secret key',
  description: 'Google Re-captcha v2 secret key',
  public: false,
  group: 'general',
  editable: true,
  type: 'text'
}
]

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate recaptcha settings');

  // eslint-disable-next-line no-restricted-syntax
  for (const setting of settings) {
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
  }
  // eslint-disable-next-line no-console
  console.log('Migrate recaptcha settings done');
  next()
}

module.exports.down = function down(next) {
  next()
}
