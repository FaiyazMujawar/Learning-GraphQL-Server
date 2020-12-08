require("dotenv").config();
const { connect } = require("mongoose");
const { ApolloServer, PubSub } = require("apollo-server");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

const pubSub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubSub }),
});

connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() =>
    server
      .listen(5000)
      .then((res) => console.log(`Server started at ${res.url}`))
  )
  .catch((err) => console.log(err));
