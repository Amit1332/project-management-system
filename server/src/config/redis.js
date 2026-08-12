// server/src/config/redis.js

const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;

let redisClient = null;

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    redisClient.once("ready", () => {
      console.log("✅ Redis connected successfully (Upstash)");
    });

    redisClient.on("error", (err) => {
      console.error("⚠️ Redis Warning:", err.message);
    });
  } catch (error) {
    console.error("⚠️ Failed to initialize Redis:", error.message);
    redisClient = null;
  }
} else {
  console.log("ℹ️ REDIS_URL not set in environment. Running without Redis cache.");
}

// Failsafe helper functions (never crash if Redis is unavailable)
const redisCache = {
  get: async (key) => {
    if (!redisClient) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  },

  set: async (key, value, ttlSeconds = 300) => {
    if (!redisClient) return false;
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return true;
    } catch (err) {
      return false;
    }
  },

  del: async (key) => {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (err) {
      return false;
    }
  },

  delPattern: async (pattern) => {
    if (!redisClient) return false;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};

module.exports = { redisClient, redisCache };
