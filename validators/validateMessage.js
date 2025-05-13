const { body } = require("express-validator");

// A basic offensive word list — extendable
const bannedWords = [
   "fuck",
   "shit",
   "bitch",
   "asshole",
   "damn",
   "nigger",
   "retard",
];

const containsOffensiveLanguage = (text) => {
   const lower = text.toLowerCase();
   return bannedWords.some((word) => lower.includes(word)); // Is there any word in this list that matches what I’m looking for? if so, returns True
};

const validateMessage = [
   body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required.")
      .matches(/^[A-Za-z].*/) // Starts with a letter
      .withMessage("Title must start with a letter.")
      .isLength({ min: 5, max: 100 })
      .withMessage("Title must be between 5 and 100 characters."),

   body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required.")
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters.")
      .custom((value) => {
         if (containsOffensiveLanguage(value)) {
            throw new Error(
               "Content contains inappropriate language. Please revise."
            );
         }
         return true;
      }),
];

module.exports = validateMessage;
