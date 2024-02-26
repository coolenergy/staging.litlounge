const templateMigrate = require('../migrations/1619073846178-email-template');

module.exports = async () => {
  await new Promise(resolve => templateMigrate.up(resolve));
}