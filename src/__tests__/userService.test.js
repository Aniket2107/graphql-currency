const { getExchangeRate } = require("../utils/exchangeRate");
const {
  getUser,
  getUserWallets,
  getWalletByUserIdAndCurrency,
  createUser,
  createWallet,
  depositToWallet,
  getTotalValue,
} = require("../services/userService");
const User = require("../models/user");
const Wallet = require("../models/wallet");

jest.mock("../models/user");
jest.mock("../models/wallet");
jest.mock("../utils/exchangeRate");

describe("User Service", () => {
  beforeEach(() => {
    User.findById.mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: "user_1234",
        name: "Aniket",
        wallets: [{ currency: "USD", balance: 100 }],
      }),
    }));

    User.mockImplementation((userData) => ({
      ...userData,
      _id: "user_1234",
      wallets: [],
      save: jest.fn().mockResolvedValue({
        _id: "user_1234",
        name: userData.name,
        wallets: [],
      }),
    }));

    Wallet.mockImplementation((walletData) => ({
      ...walletData,
      _id: "wallet_1234",
      balance: 0,
      save: jest.fn().mockResolvedValue({
        ...walletData,
        _id: "wallet_1234",
        balance: 0,
      }),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUser", () => {
    test("should retrieve a user by ID and populate wallets", async () => {
      const user = await getUser("user_1234");

      expect(user.name).toBe("Aniket");
      expect(user.wallets).toEqual([{ currency: "USD", balance: 100 }]);
    });
  });

  describe("getUserWallets", () => {
    it("should retrieve wallets by user ID", async () => {
      const mockWallets = [{ currency: "USD", balance: 100 }];
      Wallet.find.mockResolvedValueOnce(mockWallets);

      const wallets = await getUserWallets("user_1234");

      expect(Wallet.find).toHaveBeenCalledWith({ userId: "user_1234" });
      expect(wallets).toEqual(mockWallets);
    });
  });

  describe("getWalletByUserIdAndCurrency", () => {
    it("should retrieve wallet by user ID and currency", async () => {
      const mockWallet = { userId: "user_1234", currency: "USD", balance: 100 };
      Wallet.findOne.mockResolvedValueOnce(mockWallet);

      const wallet = await getWalletByUserIdAndCurrency("user_1234", "USD");

      expect(Wallet.findOne).toHaveBeenCalledWith({
        userId: "user_1234",
        currency: "USD",
      });
      expect(wallet).toEqual(mockWallet);
    });
  });

  describe("createUser", () => {
    test("should create a new user", async () => {
      const user = await createUser("Yash");

      expect(user.name).toBe("Yash");
      expect(user.wallets).toEqual([]);
    });
  });

  describe("depositToWallet", () => {
    it("should deposit amount into a user's wallet", async () => {
      const mockWallet = {
        userId: "user_1234",
        currency: "USD",
        balance: 100,
        save: jest.fn(),
      };
      Wallet.findOne.mockResolvedValueOnce(mockWallet);

      const updatedWallet = await depositToWallet("user_1234", "USD", 50);

      expect(updatedWallet.balance).toBe(150);
      expect(mockWallet.save).toHaveBeenCalled();
    });

    it("should throw an error if amount is not greater than zero", async () => {
      await expect(depositToWallet("user_1234", "USD", -10)).rejects.toThrow(
        "Deposit amount must be greater than zero."
      );
    });

    it("should throw an error if wallet does not exist", async () => {
      Wallet.findOne.mockResolvedValueOnce(null);

      await expect(depositToWallet("user_1234", "USD", 50)).rejects.toThrow(
        "Wallet not found for this currency."
      );
    });
  });

  describe("getTotalValue", () => {
    it("should calculate total value in the target currency", async () => {
      const mockWallets = [
        { currency: "USD", balance: 100 },
        { currency: "EUR", balance: 50 },
      ];
      Wallet.find.mockResolvedValueOnce(mockWallets);

      getExchangeRate.mockResolvedValueOnce(84.12); // USD to target currency
      getExchangeRate.mockResolvedValueOnce(91.01); // EUR to target currency

      // Calculating total value in INR:
      // From USD: 100 USD * 84.12 INR/USD = 8412 INR
      // From EUR: 50 EUR * 91.01 INR/EUR = 4550.5 INR
      // Total = 7500 + 4500 = 12962.5 INR

      const totalValue = await getTotalValue("user_1234", "INR");

      expect(totalValue).toBeCloseTo(12962.5, 3);
      expect(Wallet.find).toHaveBeenCalledWith({ userId: "user_1234" });
      expect(getExchangeRate).toHaveBeenCalledTimes(2);
    });

    it("should return the balance directly if currency matches target", async () => {
      const mockWallets = [{ currency: "USD", balance: 100 }];
      Wallet.find.mockResolvedValueOnce(mockWallets);

      const totalValue = await getTotalValue("user_1234", "USD");

      expect(totalValue).toBe(100);
    });
  });
});
