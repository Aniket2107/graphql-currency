async function isCurrencyValid(currency) {
  if (currency && currency.length === 3) return true;
  return false;

  // WE CAN CALL STRIPE API AND CHECK IF THE CURRENCY IS VALID, ALONG WITH CACHING THIS CAN BE OPTIMIZED
  //   try {
  //     const response = await axios.get(`https://stripe-api.com/currencies`);
  //     const validCurrencies = response.data.data.map((curr) => curr.id);
  //     if (validCurrencies.includes(currency)) {
  //       // Cache the valid currency in Redis for future use
  //       cacheCurrency(currency);
  //       console.log(`Currency ${currency} is valid (fetched from API).`);
  //       return true;
  //     } else {
  //       console.log(`Currency ${currency} is invalid.`);
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Error fetching currencies from Stripe API:", error);
  //     return false;
  //   }
}
