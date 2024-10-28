const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const { getExchangeRate } = require("../utils/exchangeRate");

const pubsub = require("../utils/pubsub");

/*
ASSUMPTIONS MADE FOR THIS SERVICE:
userA has wallets [USD, EUR]
userB has wallets [USD, INR]

Receiving money:
each user can recive money only if they have wallet of respective currency
eg: UserB cannot receive EUR, first user will have to create a wallet of that currency only then its possible

Sending money:
user can send amount to any user with any currency 
eg userA can send INR, though userA doesn't have INR, its the receiver wallet that matters
*/

async function transferFunds(
  senderId,
  recipientId,
  fromCurrency,
  toCurrency,
  targetAmount
) {
  try {
    // const session = await mongoose.startSession(); // MongoDB requires replica-set for transaction so commented this code for now
    // session.startTransaction();
    // transactions ensures the atomicity and consistency

    const [senderWallet, recipientWallet] = await Promise.all([
      Wallet.findOne({ userId: senderId, currency: fromCurrency }),
      Wallet.findOne({ userId: recipientId, currency: toCurrency }),
    ]);

    if (!senderWallet) {
      throw new Error(`Sender's wallet in ${fromCurrency} does not exist.`);
    }
    if (!recipientWallet) {
      throw new Error(`Recipient's wallet in ${toCurrency} does not exist.`);
    }

    const exchangeRate = await getExchangeRate(toCurrency, fromCurrency);
    if (!exchangeRate) throw new Error("Unable to retrieve exchange rate.");

    const equivalentAmountInSenderCurrency = parseFloat(
      targetAmount * exchangeRate
    ).toFixed(3);

    if (senderWallet.balance < equivalentAmountInSenderCurrency) {
      throw new Error("Insufficient balance in sender’s wallet.");
    }

    senderWallet.balance = parseFloat(
      (senderWallet.balance - equivalentAmountInSenderCurrency).toFixed(3)
    );
    recipientWallet.balance = parseFloat(
      (recipientWallet.balance + targetAmount).toFixed(3)
    );

    await Promise.all([senderWallet.save(), recipientWallet.save()]);

    const transaction = await Transaction.create([
      {
        senderId,
        recipientId,
        fromCurrency,
        toCurrency,
        amountSent: equivalentAmountInSenderCurrency,
        amountReceived: targetAmount,
        exchangeRate,
        status: "SUCCESS",
      },
    ]);

    pubsub.publish("WALLET_UPDATE", {
      wallet_update: {
        userId: senderId,
      },
    });
    pubsub.publish("WALLET_UPDATE", {
      wallet_update: {
        userId: recipientId,
      },
    });

    return {
      success: true,
      message: "Transfer successful",
      transaction: transaction[0],
    };

    // await session.commitTransaction()
    // session.endSession();
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession()

    console.error("Transfer failed:", error);

    return {
      success: false,
      message: `Transfer failed: ${error.message}`,
    };
  }
}

module.exports = { transferFunds };
