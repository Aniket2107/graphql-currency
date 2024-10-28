const redis = require("redis");

const client = redis.createClient({
  url: "redis://localhost:6379", 
});

client.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  await client.connect();
};

const disconnectRedis = async () => {
  await client.quit();
};

module.exports = { client, connectRedis, disconnectRedis };
