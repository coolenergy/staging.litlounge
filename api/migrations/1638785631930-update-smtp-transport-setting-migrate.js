const { DB, COLLECTION } = require('./lib');

module.exports.up = async function up(next) {
  const SETTING_KEYS = {
    SMTP_TRANSPORTER: 'smtpTransporter',
    SMTP_TRANSPORTER_HOST: 'smtpTransporterHost',
    SMTP_TRANSPORTER_PORT: 'smtpTransporterPort',
    SMTP_TRANSPORTER_USERNAME: 'smtpTransporterUsername',
    SMTP_TRANSPORTER_PASSWORD: 'smtpTransporterPassword',
    SMTP_TRANSPORTER_SECURE: 'smtpTransporterSecure'
  };
  const settings = [
    {
      key: SETTING_KEYS.SMTP_TRANSPORTER_HOST,
      value: '',
      name: 'Host',
      description: 'SMTP Transporter Host',
      public: false,
      group: 'mailer',
      editable: true,
      visible: true,
      type: 'text'
    },
    {
      key: SETTING_KEYS.SMTP_TRANSPORTER_PORT,
      value: 465,
      name: 'Host',
      description: 'SMTP Transporter Port',
      public: false,
      group: 'mailer',
      editable: true,
      visible: true,
      type: 'number'
    },
    {
      key: SETTING_KEYS.SMTP_TRANSPORTER_USERNAME,
      value: '',
      name: 'Auth User',
      description: 'SMTP Transporter Auth User',
      public: false,
      group: 'mailer',
      editable: true,
      visible: true,
      type: 'text'
    },
    {
      key: SETTING_KEYS.SMTP_TRANSPORTER_PASSWORD,
      value: '',
      name: 'Auth Password',
      description: 'SMTP Transporter Auth Password',
      public: false,
      group: 'mailer',
      editable: true,
      visible: true,
      type: 'password'
    },
    {
      key: SETTING_KEYS.SMTP_TRANSPORTER_SECURE,
      value: '',
      name: 'Secure',
      description: 'SMTP Transporter Secure (true for port 465, false for other ports)',
      public: false,
      group: 'mailer',
      editable: true,
      visible: true,
      type: 'boolean'
    }
  ];

  await DB.collection(COLLECTION.SETTING).deleteOne({ key: SETTING_KEYS.SMTP_TRANSPORTER });

  // eslint-disable-next-line no-console
  console.log('Migrate SMTP Transport settings');

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
  console.log('Migrate SMTP Transport settings done');
  next();
}

module.exports.down = function down(next) {
  next();
}
