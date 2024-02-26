require('dotenv').config();
const mongoose = require('mongoose');

const args = process.argv.slice(2);

if (args.length && !args[0]) {
  // eslint-disable-next-line no-console
  console.log('Missing component, run: script your-script-file');
  process.exit();
} else {
  const file = args[0];
  // eslint-disable-next-line no-console
  console.log('Start to run the script...');
  setTimeout(async () => {
      // connect mongoose in the boot then other scripts can use
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });

    // eslint-disable-next-line global-require, import/no-dynamic-require
    await require(`./scripts/${file}`)()

    // eslint-disable-next-line no-console
    console.log('Done script!');
    process.exit();
  });
}
