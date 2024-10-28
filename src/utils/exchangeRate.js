const axios = require("axios");

const { client } = require("../utils/redis");
const config = require("../../config/config");

const getExchangeRate = async (fromCurrency, toCurrency) => {
  const cachedRate = await client.get(`${fromCurrency}_${toCurrency}`);
  const reverseCachedRate = await client.get(`${toCurrency}_${fromCurrency}`);

  if (cachedRate) {
    console.log("returned from cache", cachedRate);
    return JSON.parse(cachedRate);
  }

  if (reverseCachedRate) {
    console.log("returned from cache 2", reverseCachedRate);

    return 1 / JSON.parse(reverseCachedRate);
  }

  const response = await axios.get(config.alphaVantageApiUrl, {
    params: {
      function: "CURRENCY_EXCHANGE_RATE",
      from_currency: fromCurrency,
      to_currency: toCurrency,
      apikey: config.alphaVantageApiKey,
    },
  });

  const exchangeRate = response.data["Realtime Currency Exchange Rate"];

  if (exchangeRate) {
    const rate = parseFloat(exchangeRate["5. Exchange Rate"]);

    await client.set(`${fromCurrency}_${toCurrency}`, JSON.stringify(rate), {
      EX: 300,
    });
    await client.set(
      `${toCurrency}_${fromCurrency}`,
      JSON.stringify(1 / rate),
      {
        EX: 300,
      }
    );

    return rate;
  } else {
    throw new Error("Unable to fetch exchange rate.");
  }
};

module.exports = { getExchangeRate };
