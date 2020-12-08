const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  createdAt: String,
});

module.exports = model("User", UserSchema);
