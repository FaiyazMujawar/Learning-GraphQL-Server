// const isEmail = require("validator/lib/isEmail");
const { isEmail } = require("validator").default;

const validateRegisterInput = (username, email, password, confirmPassword) => {
  const errors = {};
  if (username.trim() === "") {
    errors["username"] = "Username must not be empty.";
  }

  if (email.trim() === "") {
    errors["email"] = "Email must not be empty.";
  } else {
    if (!isEmail(email)) {
      errors["email"] = "Email must be a valid email.";
    }
  }

  if (password === "") {
    errors["password"] = "Password must not be empty.";
  } else if (confirmPassword === "") {
    errors["confirmPassword"] = "Please re-enter password to confirm.";
  } else if (password !== confirmPassword) {
    errors["password"] = "Passwords must match";
  }

  return { errors, valid: Object.keys(errors).length === 0 };
};

const validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors["username"] = "Username must not be empty.";
  }

  if (password === "") {
    errors["password"] = "Password must not be empty.";
  }

  return { errors, valid: Object.keys(errors).length === 0 };
};

module.exports = { validateRegisterInput, validateLoginInput };
