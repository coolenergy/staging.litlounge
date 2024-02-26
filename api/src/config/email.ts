export default {
  transport: process.env.MAILER_TRANSPORT || 'sendgrid',
  apiKey: process.env.SENDGRID_API_KEY || 'SG.....'
};
