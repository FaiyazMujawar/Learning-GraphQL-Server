const postResolvers = require("./Posts");
const userResolvers = require("./Users");

module.exports = {
  Post: {
    commentCount: (parent) => parent.comments.length,
    likeCount: (parent) => parent.likes.length,
  },
  Query: {
    ...postResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutations,
    ...postResolvers.Mutations,
  },
  Subscription: {
    ...postResolvers.Subscriptions,
  },
};
