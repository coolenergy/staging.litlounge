/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { readdirSync } = require('fs');
const { readFileSync } = require('fs');
const { join, parse } = require('path');
const { DB, COLLECTION } = require("./lib");

const TEMPLATE_DIR = join(__dirname, '..', 'src', 'templates', 'emails');

const templateMap = {
  'admin-payment-success': {
    name: 'Payment success to admin',
    subject: 'New payment success',
    desc: 'Notification email will be sent to admin email after payment made successfully'
  },
  'contact': {
    name: 'Contact email',
    subject: 'New contact',
    desc: 'Notification email when having submit from contact page'
  },
  'email-verification': {
    name: 'Email verification',
    subject: 'Verify your email address',
    desc: 'Email will be sent to user to verify their email address'
  },
  'forgot': {
    name: 'Forgot password',
    desc: 'Email will be sent for forgot password process'
  },
  'payout-request': {
    name: 'Payout request notification',
    subject: 'New payout request',
    desc: 'Email to admin email after having payout request from performer'
  },
  'payout-request-update': {
    name: 'Payout request status change update notification',
    subject: 'Update your payout request',
    desc: 'Email to model/performer email after admin change payout request status'
  },
  'performer-payment-success': {
    name: 'Payment success to performer',
    subject: 'New payment success',
    desc: 'Email to performer after user purchased their assets'
  },
  'send-user-digital-product': {
    name: 'Digital product download link',
    subject: 'Digital product download',
    desc: 'Email to user with digital download link after purchased digital product.'
  },
  'update-order-status': {
    name: 'Order status change',
    subject: 'Your order status has been updated',
    desc: 'Email notification to user when performer updates order status'
  },
  'user-payment-success': {
    name: 'Payment success to user',
    subject: 'New payment success',
    desc: 'Email to user after user purchased website products'
  }
};

module.exports.up = async function up (next) {
  const files = readdirSync(TEMPLATE_DIR).filter(f => f.includes('.html'));
  for (const file of files) {
    const content = readFileSync(join(TEMPLATE_DIR, file)).toString();
    const key = parse(file).name;
    const exist = await DB.collection(COLLECTION.EMAIL_TEMPLATE).findOne({ key });
    if (!exist) {
      await DB.collection(COLLECTION.EMAIL_TEMPLATE).insertOne({
        key,
        content,
        name: templateMap[key] ? templateMap[key].name : key,
        description: templateMap[key] ? templateMap[key].desc : 'N/A',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  // layout file
  const defaultLayout = await DB.collection(COLLECTION.EMAIL_TEMPLATE).findOne({
    key: 'layouts/default'
  });
  if (!defaultLayout) {
    const layoutFile = readFileSync(join(TEMPLATE_DIR, 'layouts/default.html')).toString();
    await DB.collection(COLLECTION.EMAIL_TEMPLATE).insertOne({
      key: 'layouts/default',
      subject: 'Default template',
      content: layoutFile,
      name: 'Default layout',
      description: 'Default layout, template content will be replaced by [[BODY]]',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  next();
}

module.exports.down = function down(next) {
  next();
}