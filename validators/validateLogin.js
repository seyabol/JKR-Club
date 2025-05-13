const { body } = require("express-validator");

const validateLogin = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Username or Email cannot be empty.")
    .custom((value) => {
      const isEmail = value.includes("@");
      const isUsername = /^[a-zA-Z0-9_]+$/.test(value);

      if (!isEmail && !isUsername) {
        throw new Error(
          "Please enter a valid email or a username (letters, numbers, underscores only)."
        );
      }

      return true;
    }),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password cannot be empty."),
];

module.exports = validateLogin;
