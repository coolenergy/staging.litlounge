const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  SITE_NAME: 'siteName',
  LOGO_URL: 'logoUrl',
  REQUIRE_EMAIL_VERIFICATION: 'requireEmailVerification',
  PLACEHOLDER_LOGIN_URL: 'placeholderLoginUrl',
  PLACEHOLDER_AVATAR_URL: 'placeholderAvatarUrl',
  FAVICON: 'favicon',
  ADMIN_EMAIL: 'adminEmail',
  SENDER_EMAIL: 'senderEmail',
  EMAIL_VERIFICATION_SUCCESS_URL: 'emailVerificationSuccessUrl',
  META_KEYWORDS: 'metaKeywords',
  META_DESCRIPTION: 'metaDescription',
  HEADER_SCRIPT: 'headerScript',
  AFTER_BODY_SCRIPT: 'afterBodyScript',
  PERFORMER_COMMISSION: 'defaultCommission',
  STUDIO_COMMISSION: 'studioCommission',
  CCBILL_SUB_ACCOUNT_NUMBER: 'ccbillSubAccountNumber',
  CCBILL_FLEXFORM_ID: 'ccbillFlexformId',
  CCBILL_SALT: 'ccbillSalt',
  CCBILL_CLIENT_ACCOUNT_NUMBER: 'ccbillClientAccountNumber',
  CCBILL_CURRENCY_CODE: 'ccbillCurrencyCode',
  CURRENCY_CODE: 'currencyCode',
  CURRENCY: 'currency',
  CURRENCY_SYMBOL: 'currencySymbol',
  SMTP_TRANSPORTER: 'smtpTransporter',
  GOOGLE_ANALYTICS_CODE: 'gaCode',
  MAINTENANCE_MODE: 'maintenanceMode',
  PRIVATE_C2C_PRICE: 'privateC2CPrice',
  GROUP_CHAT_DEFAULT_PRICE: 'groupChatDefaultPrice',
  TIP_SOUND: 'tipSound',
  DEFAULT_OFFLINE_MODEL_IMAGE: 'defaultOfflineModelImage',
  DEFAULT_MODEL_PRIVATECALL_WITH_USER_IMAGE: 'defaultPrivateCallImage',
  DEFAULT_MODEL_IN_GROUP_CHAT_IMAGE: 'defaultGroupChatImage',
  CONVERSION_RATE: 'conversionRate',
  VIEWER_URL: 'viewerURL',
  PUBLISHER_URL: 'publisherURL',
  SUBSCRIBER_URL: 'subscriberUrl',
  OPTION_FOR_BROADCAST: 'optionForBroadcast',
  OPTION_FOR_PRIVATE: 'optionForPrivate',
  OPTION_FOR_GROUP: 'optionForGroup',
  SECURE_OPTION: 'secureOption',
  PAYMENT_GATEWAY: 'paymentgateway',
  FOOTER_CONTENT: 'footerContent',
  ANT_MEDIA_API_ENDPOINT: 'AntMediaApiEndpoint',
  ANT_MEDIA_APPNAME: 'AntMediaAppname',
  ANT_MEDIA_ENTERPRISE: 'AntMediaEnterprise',
  SINGULAR_TEXT_MODEL: 'singularTextModel',
  PLURAL_TEXT_MODEL: 'pluralTextModel',
  POPUP_18_ENABLED: 'popup18Enabled',
  POPUP_18_CONTENT_ID: 'popup18ContentId'
};

const settings = [
  {
    key: SETTING_KEYS.SITE_NAME,
    value: process.env.SITE_NAME || 'Application',
    name: 'Site name',
    description: 'Global name',
    public: true,
    group: 'general',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.LOGO_URL,
    value: '',
    name: 'Logo',
    description: 'Site logo',
    public: true,
    group: 'general',
    editable: true,
    meta: {
      upload: true,
      image: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.FAVICON,
    value: '',
    name: 'Favicon',
    description: 'Site Favicon',
    public: true,
    group: 'general',
    editable: true,
    meta: {
      upload: true,
      image: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.PLACEHOLDER_LOGIN_URL,
    value: '',
    name: 'Placeholder Login Img',
    description: 'Placeholder Image on Login Page',
    public: true,
    group: 'general',
    editable: true,
    meta: {
      upload: true,
      image: true
    },
    visible: true
  },

  {
    key: SETTING_KEYS.PLACEHOLDER_AVATAR_URL,
    value: '',
    name: 'No Avatar Img',
    description: 'Placeholder No Avatar Image',
    public: true,
    group: 'general',
    editable: true,
    meta: {
      upload: true,
      image: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.TIP_SOUND,
    value: '',
    name: 'Tip Sound',
    description: 'Tip Sound',
    public: true,
    group: 'custom',
    editable: true,
    meta: {
      upload: true,
      sound: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.DEFAULT_OFFLINE_MODEL_IMAGE,
    value: '',
    name: 'Default Image When Model Is not Streaming',
    description: 'Default Image When Model Is not Streaming',
    public: true,
    group: 'custom',
    editable: true,
    meta: {
      upload: true,
      image: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.DEFAULT_MODEL_PRIVATECALL_WITH_USER_IMAGE,
    value: '',
    name: 'Default Image When Model Is Private Call',
    description: 'Default Image When Model Is Private Call With User',
    public: true,
    group: 'custom',
    editable: true,
    meta: {
      upload: true,
      image: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.DEFAULT_MODEL_IN_GROUP_CHAT_IMAGE,
    value: '',
    name: 'Default Image When Model Is Group Chat',
    description: 'Default Image When Model Is Group Chat',
    public: true,
    group: 'custom',
    editable: true,
    meta: {
      upload: true,
      image: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION,
    value: false,
    name: 'Require email verification',
    description:
      'If active, user must verify email before log in to system',
    type: 'boolean',
    public: false,
    group: 'general',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.MAINTENANCE_MODE,
    value: false,
    name: 'Maintenance mode',
    description:
      'If active, user will see maintenance page once visiting site',
    type: 'boolean',
    public: true,
    group: 'general',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.POPUP_18_ENABLED,
    value: false,
    name: 'Enable popup 18+',
    description:
      'Enable if you want popup 18+',
    type: 'boolean',
    public: true,
    group: 'general',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.POPUP_18_CONTENT_ID,
    value: '',
    name: 'Popup 18Plus Content',
    description:'',
    type: 'post',
    public: true,
    group: 'general',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.ADMIN_EMAIL,
    value: process.env.ADMIN_EMAIL || `admin@${process.env.DOMAIN}`,
    name: 'Admin email',
    description: 'Email will receive information from site features and contact',
    public: false,
    group: 'email',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.SENDER_EMAIL,
    value: process.env.SENDER_EMAIL || `noreply@${process.env.DOMAIN}`,
    name: 'Sender email',
    description: 'Email will send application email',
    public: false,
    group: 'email',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.EMAIL_VERIFICATION_SUCCESS_URL,
    value: `https://${process.env.DOMAIN}/auth/login`,
    name: 'Email Verification Success Url',
    description: 'Redirect url after email verified success',
    public: false,
    editable: true,
    visible: true,
    group: 'email'
  },
  {
    key: SETTING_KEYS.META_KEYWORDS,
    value: '',
    name: 'Home meta keywords',
    description: 'Custom meta keywords',
    public: true,
    group: 'custom',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.META_DESCRIPTION,
    value: '',
    name: 'Home meta description',
    description: 'Custom meta description',
    public: true,
    group: 'custom',
    editable: true,
    type: 'text',
    meta: {
      textarea: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.HEADER_SCRIPT,
    value: '',
    name: 'Custom header script',
    description: 'Custom code in <head> tag',
    public: true,
    group: 'custom',
    editable: true,
    type: 'text',
    meta: {
      textarea: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.AFTER_BODY_SCRIPT,
    value: '',
    name: 'Custom body script',
    description: 'Custom code at end of <body> tag',
    public: true,
    group: 'custom',
    editable: true,
    type: 'text',
    meta: {
      textarea: true
    },
    visible: true
  },
  {
    key: SETTING_KEYS.FOOTER_CONTENT,
    value: `<p style="text-align:center;"><strong>${process.env.DOMAIN} © Copyright 2021. All Rights Reserved</strong></p><p style="text-align:center;"></p><img src="https://www.dmca.com/img/dmca_logo.png?=sd" alt="undefined" style="height: auto;width: 70px"/><p></p>`,
    name: 'Footer content',
    description: 'Add texts for your footer here',
    public: true,
    group: 'general',
    editable: true,
    visible: true,
    type: 'text-editor'
  },
  {
    key: SETTING_KEYS.PERFORMER_COMMISSION,
    value: 50,
    name: 'Performer Commission',
    description: 'Default commission for performer. Studio will earn by this percentage',
    public: false,
    group: 'commission',
    editable: true,
    type: 'commission',
    visible: true
  },
  {
    key: SETTING_KEYS.STUDIO_COMMISSION,
    value: 50,
    name: 'Studio Commission',
    description: 'Default commission for studio. Studio will earn by this percentage',
    public: false,
    group: 'commission',
    editable: true,
    type: 'commission',
    visible: true
  },
  {
    key: SETTING_KEYS.CCBILL_SUB_ACCOUNT_NUMBER,
    value: '',
    name: 'Sub account number',
    description: 'CCbill sub account number',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.CCBILL_FLEXFORM_ID,
    value: '',
    name: 'Flexform ID',
    description: 'CCbill flexform ID',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.CCBILL_SALT,
    value: '',
    name: 'Salt',
    description: 'CCbill salt',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER,
    value: '',
    name: 'Client account number',
    description: 'CCbill merchant account number (eg: 987654)',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.CCBILL_CURRENCY_CODE,
    value: '840',
    name: 'Currency code',
    description:
      'CCbill currency code (eg: USD - 840, EUR - 978). View more details at https://kb.ccbill.com/Webhooks+User+Guide#Appendix_A:_Currency_Codes',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.SMTP_TRANSPORTER,
    value: {
      host: '',
      port: 465,
      secure: true,
      auth: {
        user: '',
        pass: ''
      }
    },
    name: 'SMTP Transport',
    description: 'Set up SMTP here',
    public: false,
    group: 'mailer',
    editable: true,
    type: 'mixed',
    visible: true
  },
  {
    key: SETTING_KEYS.GOOGLE_ANALYTICS_CODE,
    value: '',
    name: 'GA code',
    description: 'Google Analytics Code',
    public: true,
    group: 'analytics',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.PRIVATE_C2C_PRICE,
    value: 0,
    name: 'Private C2C default price',
    description: 'Private C2C default price (token)',
    public: false,
    group: 'default-price',
    editable: true,
    type: 'number',
    visible: true
  },
  {
    key: SETTING_KEYS.GROUP_CHAT_DEFAULT_PRICE,
    value: 0,
    name: 'Group Chat default price',
    description: 'Group Chat default price (token)',
    public: false,
    group: 'default-price',
    editable: true,
    type: 'number',
    visible: true
  },
  {
    key: SETTING_KEYS.CONVERSION_RATE,
    value: process.env.CONVERSION_RATE || 1,
    name: 'Conversion Rate',
    description: '1 tokens = X USD',
    public: false,
    group: 'general',
    editable: true,
    type: 'number',
    meta: {
      min: 0,
      max: 1,
      step: 0.001
    },
    visible: true
  },
  {
    key: SETTING_KEYS.ANT_MEDIA_API_ENDPOINT,
    value: 'http://localhost:5080',
    name: 'Api Server',
    description: 'Ant Media Api Server Endpoint eg https://stream.yourserver.com',
    public: false,
    group: 'ant',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.ANT_MEDIA_APPNAME,
    value: 'LiveApp',
    name: 'App Name',
    description: 'Ant Media AppName (LiveApp or WebRTCApp)',
    public: true,
    group: 'ant',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.VIEWER_URL,
    value: `streaming.${process.env.DOMAIN}`,
    name: 'Viewer domain',
    description: 'Viewer domain for HLS option eg streaming.yourdomain.com',
    public: true,
    group: 'ant',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.PUBLISHER_URL,
    value: `streaming.${process.env.DOMAIN}`,
    name: 'Publisher domain',
    description: 'Publisher domain eg streaming.yourdomain.com',
    public: true,
    group: 'ant',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.SUBSCRIBER_URL,
    value: `streaming.${process.env.DOMAIN}`,
    name: 'Subscriber domain',
    description: 'Subscriber domain for WebRTC option url eg streaming.yourdomain.com',
    public: true,
    group: 'ant',
    editable: true,
    type: 'text',
    visible: true
  },
  {
    key: SETTING_KEYS.OPTION_FOR_BROADCAST,
    value: 'hls',
    name: 'Option for broadcast ',
    description: 'Option Broadcast',
    public: true,
    group: 'ant',
    editable: true,
    visible: true,
    type: 'dropdown',
    extra: 'WebRTC option is available for Ant enterprise version only',
    meta: {
      value: [
        { key: 'hls', name: 'HLS' },
        { key: 'webrtc', name: 'webRTC' }
      ]
    }
  },
  {
    key: SETTING_KEYS.OPTION_FOR_PRIVATE,
    value: 'hls',
    name: 'Option for private ',
    description: 'Option Private',
    public: true,
    group: 'ant',
    visible: true,
    editable: true,
    type: 'dropdown',
    extra: 'WebRTC option is available for Ant enterprise version only',
    meta: {
      value: [
        { key: 'hls', name: 'HLS' },
        { key: 'webrtc', name: 'webRTC' }
      ]
    }
  },
  {
    key: SETTING_KEYS.OPTION_FOR_GROUP,
    value: 'hls',
    name: 'Option for group ',
    description: 'Option Group',
    public: true,
    group: 'ant',
    visible: true,
    editable: true,
    type: 'dropdown',
    extra: 'WebRTC option is available for Ant enterprise version only',
    meta: {
      value: [
        { key: 'hls', name: 'HLS' },
        { key: 'webrtc', name: 'webRTC' }
      ]
    }
  },
  {
    key: SETTING_KEYS.SECURE_OPTION,
    value: false,
    name: 'Secure option ',
    description: 'Option Secure',
    public: true,
    group: 'ant',
    editable: true,
    visible: true,
    type: 'boolean',
    meta: {
      hint: 'WebRTC option is available for Ant enterprise version only'
    }
  },
  {
    key: SETTING_KEYS.PAYMENT_GATEWAY,
    value: ['ccbill'],
    name: 'Payment Gateway',
    description: 'Payment Gateway',
    public: true,
    group: 'general',
    visible: false,
    editable: false,
    type: 'checkbox',
    meta: {
      options: [
        { value: 'ccbill', label: 'CCBill' }
      ]
    }
  },
  {
    key: SETTING_KEYS.CURRENCY,
    value: 'USD',
    name: 'Curreny',
    description: 'Currency',
    public: true,
    group: 'currency',
    visible: true,
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CURRENCY_SYMBOL,
    value: '$',
    name: 'Curreny Symbol',
    description: 'Currency Symbol',
    public: true,
    group: 'currency',
    visible: true,
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.PLURAL_TEXT_MODEL,
    value: 'Models',
    name: 'Plural text',
    description:
      'Change text for plural model',
    type: 'text',
    public: true,
    group: 'customText',
    editable: true,
    visible: true
  },
  {
    key: SETTING_KEYS.SINGULAR_TEXT_MODEL,
    value: 'Model',
    name: 'Singular text',
    description:
      'Change text for singular model',
    type: 'text',
    public: true,
    group: 'customText',
    editable: true,
    visible: true
  }
];

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate settings');

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
  console.log('Migrate settings done');
  next();
}

module.exports.down = function down(next) {
  next();
}
