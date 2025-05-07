const Redis = require("ioredis");

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 5,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
    });

module.exports = redis;
