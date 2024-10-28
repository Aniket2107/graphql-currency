const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const { typeDefs } = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const { logger } = require("./utils/logger");
const config = require("../config/config");

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const apolloServer = new ApolloServer({
    schema,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  useServer({ schema }, wsServer);

  httpServer.listen(config.port, () => {
    logger.info(`Server running at http://localhost:${config.port}/graphql`);
    logger.info(
      `WebSocket server is running at ws://localhost:${config.port}/graphql`
    );
  });
}

module.exports = { startServer };
