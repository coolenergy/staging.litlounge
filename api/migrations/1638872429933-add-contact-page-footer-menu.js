const { DB, COLLECTION } = require('./lib');

module.exports.up = async function up(next) {
  const contactMenu = await DB.collection(COLLECTION.MENU).findOne({
    path: '/contact-us'
  });
  if (!contactMenu) {
    await DB.collection(COLLECTION.MENU).insertOne({
      internal: true,
      isOpenNewTab: true,
      parentId: null,
      path: '/contact-us',
      section: 'footer',
      title: 'CONTACT',
      help: '',
      ordering: 0
    });
  }
  next()
}

module.exports.down = function down(next) {
  next()
}
