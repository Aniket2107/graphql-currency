const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    wallets: [Wallet]!
  }

  type Wallet {
    id: ID!
    currency: String!
    balance: Float!
  }

  type WalletUpdatePayload {
    userId: ID!
    totalAmount: Float!
    localCurrency: String!
  }

  type TransferResult {
    success: Boolean!
    message: String!
    transaction: Transaction
  }

  type Transaction {
    id: ID!
    senderId: ID!
    recipientId: ID!
    amountSent: Float!
    fromCurrency: String!
    toCurrency: String!
    exchangeRate: Float
    timestamp: String!
  }

  type totalValueResult {
    wallets: [Wallet!]!
    totalAmount: Float!
  }

  type Query {
    getUser(id: ID!): User
    getUserWallets(id: ID!): [Wallet]
    getWallet(userId: ID!, currency: String!): Wallet
    totalValueInCurrency(userId: String!, targetCurrency: String!): Float
  }

  type Mutation {
    createUser(name: String!): User
    createWallet(userId: ID!, currency: String!): Wallet
    transferFunds(
      senderId: ID!
      receiverId: ID!
      fromCurrency: String!
      toCurrency: String!
      targetAmount: Float!
    ): TransferResult
    depositToWallet(userId: ID!, currency: String!, amount: Float): Wallet
  }

  type Subscription {
    wallet_update(userId: ID!, localCurrency: String!): WalletUpdatePayload
  }
`;

module.exports = { typeDefs };
