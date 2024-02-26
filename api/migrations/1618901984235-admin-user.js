const { DB, COLLECTION, encryptPassword, generateSalt } = require('./lib');

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
  }
}

module.exports.up = async function up(next) {
  const users = [
    {
      firstName: 'Admin',
      lastName: 'Admin',
      email: `admin@${process.env.DOMAIN || 'example.com'}`,
      username: 'admin',
      roles: ['admin'],
      status: 'active',
      emailVerified: true
    }
  ];

  const emails = users.map(user => user.email.toLowerCase());
  const sources = await DB.collection(COLLECTION.USER).find({
    email: {
      $in: emails
    }
  }).toArray();
  const existedEmails = sources.map(source => source.email);
  const newUsers = users.filter(
    user => !existedEmails.includes(user.email.toLowerCase())
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const newUser of newUsers) {
    // eslint-disable-next-line no-console
    console.log(`Seeding ${newUser.username}`)
    // eslint-disable-next-line no-await-in-loop
    const userId = await DB.collection(COLLECTION.USER).insertOne({
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    // eslint-disable-next-line no-await-in-loop
    await createAuth(newUser, userId.insertedId, 'email');
    // eslint-disable-next-line no-await-in-loop
    await createAuth(newUser, userId.insertedId, 'username');
  }

  existedEmails.forEach(email =>
    // eslint-disable-next-line no-console
    console.log(`Email ${email} have been existed`)
  );
  next();
}

module.exports.down = function down(next) {
  next();
}
