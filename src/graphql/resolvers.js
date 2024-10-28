const {
  getUser,
  getUserWallets,
  getTotalValue,
  getWalletByUserIdAndCurrency,
  createUser,
  createWallet,
  depositToWallet,
} = require("../services/userService");

const { transferFunds } = require("../services/transactionService");
const { withFilter } = require("graphql-subscriptions");

const pubsub = require("../utils/pubsub");

const Query = {
  getUser: (_, { id }) => getUser(id),
  getUserWallets: (_, { userId }) => getUserWallets(userId),
  getWallet: (_, { userId, currency }) =>
    getWalletByUserIdAndCurrency(userId, currency),
  totalValueInCurrency: (_, { userId, targetCurrency }) =>
    getTotalValue(userId, targetCurrency),
};

const Mutation = {
  createUser: (_, { name }) => createUser(name),
  createWallet: (_, { userId, currency }) => createWallet(userId, currency),
  transferFunds: (
    _,
    { senderId, receiverId, fromCurrency, toCurrency, targetAmount }
  ) =>
    transferFunds(senderId, receiverId, fromCurrency, toCurrency, targetAmount),
  depositToWallet: (_, { userId, currency, amount }) =>
    depositToWallet(userId, currency, amount),
};

const Subscription = {
  wallet_update: {
    subscribe: withFilter(
      () => pubsub.asyncIterator("WALLET_UPDATE"),
      async (payload, variables) => {
        const { userId, localCurrency } = variables;

        if (payload.wallet_update.userId !== userId) return false;

        const { totalValue } = await getTotalValue(userId, localCurrency);

        payload.wallet_update.totalAmount = totalValue;
        payload.wallet_update.localCurrency = localCurrency;

        return true;
      }
    ),
  },
};

module.exports = {
  Query,
  Mutation,
  Subscription,
};
