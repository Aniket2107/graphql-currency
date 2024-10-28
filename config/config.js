require("dotenv").config();

module.exports = {
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY,
  alphaVantageApiUrl: "https://www.alphavantage.co/query",
  mongoUri: process.env.MONGODB_URI,
  port: process.env.PORT || 4000,
  cacheTimeout: 300000,
};
