const { AuthenticationError, UserInputError } = require("apollo-server");
const { subscribe } = require("graphql");
const Post = require("../../models/Post");
const { verify } = require("../../utils/Jwt");

const resolvers = {
  Query: {
    getPosts: async () => {
      return await Post.find();
    },

    getPost: async (_, { postId }) => {
      let post = null;
      try {
        post = await Post.findById(postId);
      } catch (error) {
        throw new Error(error.message);
      }
      if (post) return post;
      else
        throw new UserInputError("No post found", {
          errors: {
            message: "No post found",
          },
        });
    },
  },

  Mutations: {
    createPost: async (_, { body }, context) => {
      if (body.trim() === "")
        throw new UserInputError("Post body must not be empty", {
          errors: {
            message: "Post body must not be empty",
          },
        });
      const user = verify(context);
      const post = await Post.create({
        body: body,
        username: user.username,
        user: user.id,
        createdAt: new Date().toISOString(),
      });
      context.pubSub.publish("NEW_POST", {
        newPost: post,
      });
      return post;
    },

    deletePost: async (_, { postId }, context) => {
      let post = null;
      const user = verify(context);
      post = await Post.findById(postId);
      if (post) {
        if (post.username === user.username) {
          post.delete();
          return "Post deleted successfully";
        }
        throw new AuthenticationError("Action unauthorized");
      } else
        throw new UserInputError("No post found", {
          errors: {
            message: "No post found",
          },
        });
    },

    createComment: async (_, { postId, body }, context) => {
      const { username } = verify(context);
      let post = null;
      if (body.trim() === "")
        throw new UserInputError("Comment body must not be empty", {
          errors: {
            message: "Comment body must not be empty",
          },
        });
      post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          username,
          body,
          createdAt: new Date().toISOString(),
        });
        return await post.save();
      }
      throw new UserInputError("No post found", {
        message: "No post found",
      });
    },

    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = verify(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex(
          (comment) => comment.id === commentId
        );
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          return await post.save();
        } else throw new AuthenticationError("Action unauthorized");
      } else
        throw new UserInputError("No post found", {
          errors: {
            message: "No post found",
          },
        });
    },

    likePost: async (_, { postId }, context) => {
      let post = null;
      const { username } = verify(context);
      post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        return await post.save();
      } else
        throw new UserInputError("No post found", {
          errors: {
            message: "No post found",
          },
        });
    },
  },

  Subscriptions: {
    newPost: () => {
      subscribe: (_, __, { pubSub }) => pubSub.asyncIterator("NEW_POST");
    },
  },
};

module.exports = resolvers;
