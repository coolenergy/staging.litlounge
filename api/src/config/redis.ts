export default {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  password: process.env.REDIS_PASSWORD || undefined,
  keyPrefix: process.env.REDIS_PRIFIX || undefined
};
