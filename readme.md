# Graphql-Currency

### Installation

1. Clone the repo and then run the following commands

```
npm install
npm start
```

2. Using Docker 
```
docker-compose up
```

### Testing

All tests are located in the **'__ tests __'** folder inside the `src` directory. To run the test cases, use the following command:

```
npm run test
```

### GraphQL Documentation
All Queries, Mutations, and Subscriptions are documented within the GraphQL playground. Navigate to http://localhost:4000/graphql in your browser to explore the API. The playground will display the available operations, required arguments, and expected responses, making it easy to understand and test each endpoint.

### Environment Variables

Before running the application, make sure to set up your environment variables. You can use the provided `.env.template` file as a reference. Create a `.env` file in the root directory of the project and add your environment variables accordingly.

## Topics Covered from the given task

### GraphQL Queries:

- Fetch users
- Fetch wallets
- Fetch wallet by currency
- Get total value of all wallets in a specified currency

### GraphQL Mutations:

- Create users
- Create wallets for a user in a desired currency
- Send money between users, converting currencies as needed

### GraphQL Subscriptions:

- Total worth change for a specific user

## Improvements

1. **Database Indexing**:
   Apply indexing with userId on wallets, transactions table since they are queried very frequently

2. **Use of Message Queues (MQ)**:
   Graphql-Subscriptions uses In-memory space, this could cause issues when scaling, we can either have a centralized redis which acts as pub-sub and then use graphql-subscriptions along with it , OR use a dedicated MQ services

3. **Caching Mechanism**: Using a caching mechanism for storing the exchange rates, we can cache the frequently used queries in db as well.

4. **Testing Coverage**: I have covered basic test-cases we can enhance on this .
