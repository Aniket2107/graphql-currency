const redis = require("redis");
const config = require("../../config/config");

const client = redis.createClient({
  url: config.redisUri,
});

client.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  await client.connect();
};

const disconnectRedis = async () => {
  await client.quit();
};

module.exports = { client, connectRedis, disconnectRedis };
