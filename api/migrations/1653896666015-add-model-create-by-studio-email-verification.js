/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { readdirSync } = require('fs');
const { readFileSync } = require('fs');
const { join, parse } = require('path');
const { DB, COLLECTION } = require("./lib");

const TEMPLATE_DIR = join(__dirname, '..', 'src', 'templates', 'emails');

const templateMap = {
  'model-create-by-studio-email-verification': {
    name: 'Model created by studio email verification',
    subject: 'Please verify your email address',
    desc: 'Email to model after studio created'
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