const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fromCurrency: { type: String, required: true }, // e.g., CAD
  toCurrency: { type: String, required: true }, // e.g., USD
  amountSent: { type: Number, required: true }, // Amount in sender’s currency
  amountReceived: { type: Number, required: true }, // Amount in recipient's currency after conversion
  exchangeRate: { type: Number }, // Rate at the time of conversion
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING",
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
