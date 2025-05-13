const { body } = require("express-validator");

const lengthErr = "must be between 1 and 30 characters.";

const validateUser = [
   body("username")
      .trim()
      .notEmpty()
      .withMessage("Username cannot be empty.")
      .matches(/^[a-zA-Z0-9_]+$/) // smilar to .isAlphanumeric()
      .withMessage(
         "Username can only contain letters, numbers, and underscores."
      )
      .isLength({ min: 1, max: 30 })
      .withMessage(`Username ${lengthErr}`),

   body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full Name cannot be empty.")
      .custom((value) => {
         if (!value.includes(" ")) {
            throw new Error(
               "Please provide both first name and last name, separated by a space."
            );
         }
         return true;
      })
      .matches(/^[A-Za-z]+(?: [A-Za-z'-]+)+$/) // Match Hyphenated or Multi-Part Names
      .withMessage(
         "Full Name must only contain letters, spaces, apostrophes, or hyphens."
      )
      .isLength({ min: 1, max: 30 })
      .withMessage(`Full Name ${lengthErr}`),

   body("email")
      .trim()
      .notEmpty()
      .withMessage("Email cannot be empty.")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),

   body("password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),

   body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("Please confirm your password.")
      .custom((value, { req }) => {
         if (value !== req.body.password) {
            throw new Error("Passwords do not match.");
         }
         return true;
      }),
];

module.exports = validateUser;
