const { DB, COLLECTION } = require("./lib")

module.exports.up = async (next) => {
  const keys = ['tipSound', 'defaultOfflineModelImage', 'defaultPrivateCallImage', 'defaultGroupChatImage', 'metaKeywords', 'metaDescription', 'headerScript', 'afterBodyScript']
  await DB.collection(COLLECTION.SETTING).updateMany({key: {$in: keys}}, {$set: {description: ''}})
  // eslint-disable-next-line no-console
  console.log('Removed setting descriptions success');
  next()
}

module.exports.down = (next) => {
  next()
}
