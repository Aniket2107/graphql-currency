const { transferFunds } = require("../services/transactionService");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const { getExchangeRate } = require("../utils/exchangeRate");

jest.mock("../models/wallet");
jest.mock("../models/transaction");
jest.mock("../utils/exchangeRate");

describe("Transfer Funds Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should transfer funds successfully from USD to INR", async () => {
    // Mock wallets
    const senderWallet = {
      userId: "sender123",
      currency: "USD",
      balance: 200,
      save: jest.fn(),
    };
    const recipientWallet = {
      userId: "recipient456",
      currency: "INR",
      balance: 1000,
      save: jest.fn(),
    };

    Wallet.findOne.mockImplementation((query) => {
      if (query.userId === "sender123" && query.currency === "USD") {
        return Promise.resolve(senderWallet);
      }
      if (query.userId === "recipient456" && query.currency === "INR") {
        return Promise.resolve(recipientWallet);
      }
      return Promise.resolve(null);
    });

    getExchangeRate.mockResolvedValue(1 / 84.12); // 1 USD = 84.12 INR
    Transaction.create.mockResolvedValue([
      { id: "txn123", senderId: "sender123", recipientId: "recipient456" },
    ]);

    const result = await transferFunds(
      "sender123",
      "recipient456",
      "USD",
      "INR",
      100
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Transfer successful");
    expect(result.transaction).toEqual(
      expect.objectContaining({ id: "txn123" })
    );
    expect(senderWallet.balance).toBeCloseTo(198.811, 3);
    expect(recipientWallet.balance).toBe(1100);
  });

  it("should transfer funds successfully from INR to EUR", async () => {
    const senderWallet = {
      userId: "sender123",
      currency: "INR",
      balance: 1000,
      save: jest.fn(),
    };
    const recipientWallet = {
      userId: "recipient456",
      currency: "EUR",
      balance: 200,
      save: jest.fn(),
    };

    Wallet.findOne.mockImplementation((query) => {
      if (query.userId === "sender123" && query.currency === "INR") {
        return Promise.resolve(senderWallet);
      }
      if (query.userId === "recipient456" && query.currency === "EUR") {
        return Promise.resolve(recipientWallet);
      }
      return Promise.resolve(null);
    });

    getExchangeRate.mockResolvedValue(91.01); // 1 EUR = 91.01 INR
    Transaction.create.mockResolvedValue([
      { id: "txn124", senderId: "sender123", recipientId: "recipient456" },
    ]);

    const result = await transferFunds(
      "sender123",
      "recipient456",
      "INR",
      "EUR",
      2
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Transfer successful");
    expect(result.transaction).toEqual(
      expect.objectContaining({ id: "txn124" })
    );
    expect(senderWallet.balance).toBe(817.98); //( 1000 - (91.01*2) ) = 817.98
    expect(recipientWallet.balance).toBe(202);
  });

  it("should transfer funds successfully from INR to INR", async () => {
    const senderWallet = {
      userId: "sender123",
      currency: "INR",
      balance: 1000,
      save: jest.fn(),
    };
    const recipientWallet = {
      userId: "recipient456",
      currency: "INR",
      balance: 200,
      save: jest.fn(),
    };

    Wallet.findOne.mockImplementation((query) => {
      if (query.userId === "sender123" && query.currency === "INR") {
        return Promise.resolve(senderWallet);
      }
      if (query.userId === "recipient456" && query.currency === "INR") {
        return Promise.resolve(recipientWallet);
      }
      return Promise.resolve(null);
    });

    getExchangeRate.mockResolvedValue(1);
    Transaction.create.mockResolvedValue([
      { id: "txn124", senderId: "sender123", recipientId: "recipient456" },
    ]);

    const result = await transferFunds(
      "sender123",
      "recipient456",
      "INR",
      "INR",
      300
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Transfer successful");
    expect(result.transaction).toEqual(
      expect.objectContaining({ id: "txn124" })
    );
    expect(senderWallet.balance).toBe(700); //( 1000 - 300 ) =
    expect(recipientWallet.balance).toBe(500);
  });

  it("should throw an error if the sender's wallet does not exist", async () => {
    Wallet.findOne.mockResolvedValueOnce(null); // Sender wallet not found

    const result = await transferFunds(
      "sender123",
      "recipient456",
      "USD",
      "INR",
      100
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Transfer failed: Sender's wallet in USD does not exist."
    );
  });

  it("should throw an error if the recipient's wallet does not exist", async () => {
    const senderWallet = {
      userId: "sender123",
      currency: "USD",
      balance: 200,
      save: jest.fn(),
    };
    Wallet.findOne.mockImplementation((query) => {
      if (query.userId === "sender123" && query.currency === "USD") {
        return Promise.resolve(senderWallet);
      }
      return Promise.resolve(null); // Recipient wallet not found
    });

    const result = await transferFunds(
      "sender123",
      "recipient456",
      "USD",
      "INR",
      100
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Transfer failed: Recipient's wallet in INR does not exist."
    );
  });

  it("should throw an error if there are insufficient funds in the sender's wallet", async () => {
    const senderWallet = {
      userId: "sender123",
      currency: "USD",
      balance: 50,
      save: jest.fn(),
    };
    const recipientWallet = {
      userId: "recipient456",
      currency: "INR",
      balance: 1000,
      save: jest.fn(),
    };

    Wallet.findOne.mockImplementation((query) => {
      if (query.userId === "sender123" && query.currency === "USD") {
        return Promise.resolve(senderWallet);
      }
      if (query.userId === "recipient456" && query.currency === "INR") {
        return Promise.resolve(recipientWallet);
      }
      return Promise.resolve(null);
    });

    getExchangeRate.mockResolvedValue(84.12); // 1 USD = 84.12 INR

    const result = await transferFunds(
      "sender123",
      "recipient456",
      "USD",
      "INR",
      100
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Transfer failed: Insufficient balance in sender’s wallet."
    );
  });

  it("should throw an error if unable to retrieve exchange rate", async () => {
    const senderWallet = {
      userId: "sender123",
      currency: "USD",
      balance: 200,
      save: jest.fn(),
    };
    const recipientWallet = {
      userId: "recipient456",
      currency: "INR",
      balance: 1000,
      save: jest.fn(),
    };

    Wallet.findOne.mockImplementation((query) => {
      if (query.userId === "sender123" && query.currency === "USD") {
        return Promise.resolve(senderWallet);
      }
      if (query.userId === "recipient456" && query.currency === "INR") {
        return Promise.resolve(recipientWallet);
      }
      return Promise.resolve(null);
    });

    getExchangeRate.mockResolvedValue(null); // Exchange rate not found

    const result = await transferFunds(
      "sender123",
      "recipient456",
      "USD",
      "INR",
      100
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Transfer failed: Unable to retrieve exchange rate."
    );
  });
});
