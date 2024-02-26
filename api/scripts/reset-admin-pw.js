const { DB, COLLECTION, generateSalt, encryptPassword } = require('../migrations/lib');

const defaultPassword = 'adminadmin';

async function createAuth(newUser, userId, type = 'email') {
  const salt = generateSalt();
  const authCheck = await DB.collection(COLLECTION.AUTH).findOne({
    type,
    source: 'user',
    sourceId: userId
  });
  if (!authCheck) {
    await DB.collection(COLLECTION.AUTH).insertOne({
      type,
      source: 'user',
      sourceId: userId,
      salt,
      value: encryptPassword(defaultPassword, salt),
      key: type === 'email' ? newUser.email : newUser.username
    });
  } else {
    await DB.collection(COLLECTION.AUTH).updateOne({
      _id: authCheck._id
    }, {
      $set: {
        type,
        salt,
        value: encryptPassword(defaultPassword, salt),
        key: type === 'email' ? newUser.email : newUser.username
      }
    });
  }
}

module.exports = async () => {
  const adminUsers = await DB.collection(COLLECTION.USER).find({ roles: 'admin' }).toArray();
  // eslint-disable-next-line no-restricted-syntax
  for (const admin of adminUsers) {
    // eslint-disable-next-line no-await-in-loop
    await createAuth(admin, admin._id, 'email');
    // eslint-disable-next-line no-await-in-loop
    await createAuth(admin, admin._id, 'username');
  }
}