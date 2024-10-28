const { getExchangeRate } = require("../utils/exchangeRate");
const { isCurrencyValid } = require("../utils/isCurrencyValid");

const User = require("../models/user");
const Wallet = require("../models/wallet");

async function getUser(id) {
  return await User.findById(id).populate("wallets").exec();
}

async function getUserWallets(userId) {
  return await Wallet.find({ userId });
}

async function getWalletByUserIdAndCurrency(userId, currency) {
  return await Wallet.findOne({ userId, currency });
}

async function createUser(name) {
  console.log("name", name);
  const user = new User({ name });
  await user.save();
  return user;
}

async function createWallet(userId, currency) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (!isCurrencyValid(currency)) {
    throw new Error("Invalid currency");
  }

  const wallet = new Wallet({ userId, currency, balance: 0 });
  await wallet.save();
  user.wallets.push(wallet._id);
  await user.save();
  return wallet;
}

async function depositToWallet(userId, currency, amount) {
  if (amount <= 0) {
    throw new Error("Deposit amount must be greater than zero.");
  }

  const wallet = await Wallet.findOne({ userId, currency });

  if (!wallet) {
    throw new Error("Wallet not found for this currency.");
  }

  wallet.balance += amount;
  await wallet.save();

  return wallet;
}

async function getTotalValue(userId, targetCurrency) {
  const wallets = await Wallet.find({ userId });

  let totalValue = 0;

  for (const wallet of wallets) {
    let walletValue = wallet.balance;

    if (wallet.currency !== targetCurrency) {
      const exchangeRate = await getExchangeRate(
        wallet.currency,
        targetCurrency
      );
      walletValue *= exchangeRate;
    }

    totalValue += walletValue;
  }

  return parseFloat(totalValue.toFixed(3));
}

module.exports = {
  getUser,
  getUserWallets,
  getWalletByUserIdAndCurrency,
  createUser,
  createWallet,
  depositToWallet,
  getTotalValue,
};
