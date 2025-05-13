// config/passportConfig.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

const cusotmFileds = {
   usernameField: "identifier", // accepts email or username
   passwordField: "password",
};

const verifyCallback = async (identifier, password, done) => {
   try {
      let user;
      if (identifier.includes("@")) {
         user = await db.getUserByEmail(identifier);
      } else {
         user = await db.getUserByUsername(identifier);
      }
      if (!user) {
         return done(null, false, { message: "User not found" });
      }
      // if (!user.can_login) {
      //    return done(null, false, {
      //       message: "This user is not allowed to log in.",
      //    });
      // }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
         return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
   } catch (err) {
      return done(err);
   }
};

passport.use(new LocalStrategy(cusotmFileds, verifyCallback));

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
   try {
      const user = await db.getById(id);
      if (!user) {
         return done(null, false);
      }
      done(null, user);
   } catch (err) {
      done(err);
   }
});

module.exports = passport;
