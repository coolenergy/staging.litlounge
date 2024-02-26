const crypto = require('crypto');

const mongoose = require('mongoose');

exports.COLLECTION = {
  SETTING: 'settings',
  USER: 'users',
  AUTH: 'auth',
  POST: 'posts',
  MENU: 'menus',
  EMAIL_TEMPLATE: 'emailtemplates',
  PERFORMER: 'performers',
  STUDIO: 'studios',
  EARNING: 'earnings',
  PAYMENT_TRANSACTION: 'paymenttransactions',
  PAYOUT_REQUEST: 'payoutrequests',
  PURCHASE_ITEM: 'purchaseitems',
  ORDER: 'orders'
};

exports.DB = mongoose.connection;

exports.encryptPassword = (pw, salt) => {
  const defaultIterations = 10000;
  const defaultKeyLength = 64;

  return crypto
    .pbkdf2Sync(pw, salt, defaultIterations, defaultKeyLength, 'sha1')
    .toString('base64');
}

exports.generateSalt = (byteSize = 16) => {
  return crypto.randomBytes(byteSize).toString('base64');
}
