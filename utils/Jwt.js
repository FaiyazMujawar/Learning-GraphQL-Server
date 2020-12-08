const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const sign = (payload) => {
  try {
    return jwt.sign(payload, process.env.SECRET, {
      expiresIn: process.env.TOKEN_LIFE,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const verify = (context) => {
  const authHeader = context.req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        return jwt.verify(token, process.env.SECRET);
      } catch (error) {
        throw new AuthenticationError("Invalid/expired token.");
      }
    } else
      throw new Error("Authorisation token must be of type 'Bearer <token>'");
  } else throw new Error("Authorisation token must be provided.");
};

module.exports = {
  sign,
  verify,
};
