const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  wallets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
