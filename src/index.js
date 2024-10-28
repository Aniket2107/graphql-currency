const { startServer } = require("./server");
const { connectDB } = require("./mongoose");
const { connectRedis } = require("./utils/redis");

async function main() {
  await connectDB();
  await connectRedis();
  startServer();
}

main().catch((err) => {
  console.error("Error starting the application:", err);
});
