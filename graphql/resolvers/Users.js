const { UserInputError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/Validators");

const { sign } = require("../../utils/Jwt");
const User = require("../../models/User");

module.exports = {
  Mutations: {
    async login(_, args) {
      let user = null;
      const { username, password } = args;
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError("Invalid Input", { errors });
      }
      user = await User.findOne({ username });
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new UserInputError("Wrong Password", {
            errors: {
              message: "Wrong Password",
            },
          });
        } else {
          const token = sign({
            id: user.id,
            username: user.username,
            email: user.email,
          });

          return {
            ...user._doc,
            id: user.id,
            token: token,
          };
        }
      } else {
        throw new UserInputError("Wrong credentials", {
          errors: {
            message: "No user found",
          },
        });
      }
    },

    async register(_, args) {
      let { username, password, confirmPassword, email } = args.registerInput;
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Invalid data", { errors });
      }
      try {
        password = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          username,
          password,
          email,
          createdAt: new Date().toISOString(),
        });

        const token = sign({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        });

        return {
          ...newUser._doc,
          id: newUser.id,
          token: token,
        };
      } catch (error) {
        if (error.code === 11000) throw new Error("Username already taken");
        else throw new Error(error.message);
      }
    },
  },
};
