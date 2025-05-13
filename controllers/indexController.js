// controllers\indexController.js

const db = require("../db/queries");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const passport = require("../config/passportConfig");
const { getRelativeTime } = require("../utils/timeFormat");

require("dotenv").config();
////////////////////////////// SIGNUP ////////////////////////////////
////////////////////////////// SIGNUP ////////////////////////////////
const signUpGet = async function (req, res) {
   res.render("signUpForm", {
      title: "JKR Club",
      oldInput: {}, // empty input to avoid undefined
      errors: [], // empty errors array
   });
};

const signUpPost = async function (req, res, next) {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.render("signUpForm", {
         errors: errors.array(),
         oldInput: req.body, // Keep their previously entered values (like name, email, etc.)
         title: "JKR Club",
      });
   }
   //    console.log("Check Check");
   const { username, fullName, email, password } = req.body;
   //    console.log("fdsfljasdflk:", fullName);
   try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insertUser(username, fullName, email, hashedPassword);
      req.flash("success", "Registration successful! You can now log in.");
      res.redirect("/login");
   } catch (error) {
      if (error.code === "23505") {
         // Determine if it's username or email
         const duplicateField = error.detail.includes("username")
            ? "Username"
            : "Email";

         return res.render("signUpForm", {
            errors: [
               {
                  msg: `${duplicateField} already exists. Please choose another.`,
               },
            ],
            oldInput: req.body,
            title: "JKR Club",
         });
      }
      next(error); // fallback for unexpected errors
   }
};

////////////////////////////// LOGIN ////////////////////////////////
////////////////////////////// LOGIN ////////////////////////////////
const loginGet = async function (req, res, next) {
   res.render("loginForm", {
      title: "JKR Club",
      oldInput: {}, // empty input to avoid undefined
      errors: req.flash("error"), // here we can get the flash error
      success: req.flash("success"),
   });
};

const loginPost = async function (req, res, next) {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.render("loginForm", {
         errors: errors.array(),
         oldInput: req.body, // Keep their previously entered values (like name, email, etc.)
         title: "JKR Club",
         success: [], 
      });
   }
   return passport.authenticate("local", {
      successRedirect: "/dashboard", // or wherever
      failureRedirect: "/login",
      failureFlash: true,
   })(req, res, next); // ← .authenticate() returns a middleware function, and needs to called if it not using directly as route middleware like post('/login', .autheticate())
};
////////////////////////////// DASHBOARD ////////////////////////////////
////////////////////////////// DASHBOARD ////////////////////////////////
const dashboardGet = function (req, res) {
   res.render("dashboard", {
      user: req.user,
      success: req.flash("success"),
   });
};
////////////////////////////// LOGOUT ///////////////////////////////////
////////////////////////////// LOGOUT ///////////////////////////////////
const logoutGet = (req, res, next) => {
   req.logout((err) => {
      // Removes req.user, and clears the session.passport value from the session.
      if (err) {
         return next(err);
      }
      req.session.destroy(() => {
         res.clearCookie("connect.sid");
         res.redirect("/login");
      });
   });
};
////////////////////////////// JOIN THE CLUB ///////////////////////////////////
////////////////////////////// JOIN THE CLUB ///////////////////////////////////

const joinTheClubGet = (req, res, next) => {
   res.render("joinClub", {
      title: " Become a Member",
      errors: [],
   });
};

const joinTheClubPost = async (req, res, next) => {
   const { secret } = req.body;
   if (secret === process.env.MEMBER_PASSCODE) {
      await db.updateMembership(req.user.id);
      req.user.is_member = true;
      return res.redirect("/dashboard");
   }
   res.render("joinClub", {
      title: " Become a Member",
      errors: ["Incorrect passcode."],
   });
};
////////////////////////////// BECOME ADMIN ///////////////////////////////////
////////////////////////////// BECOME ADMIN ///////////////////////////////////
const becomeAdminGet = (req, res, next) => {
   res.render("becomeAdmin", {
      title: "Become an Admin",
      errors: [],
   });
};
const becomeAdminPost = async (req, res, next) => {
   const { secret } = req.body;
   if (secret === process.env.ADMIN_PASSCODE) {
      await db.updateAdmin(req.user.id);
      req.user.is_admin = true;
      return res.redirect("/dashboard");
   }
   res.render("becomeAdmin", {
      title: " Become a Member",
      errors: ["Incorrect passcode."],
   });
};

////////////////////////////// CREATE MESSAGE ///////////////////////////////////
////////////////////////////// CREATE MESSAGE ///////////////////////////////////

const createMessageGet = (req, res, next) => {
   res.render("createMessageForm", {
      title: "Create Message",
      oldInput: {}, // empty input to avoid undefined
      errors: [], // empty errors array });,
   });
};
const createMessagePost = async (req, res, next) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.render("createMessageForm", {
         title: "Create a Message",
         errors: errors.array(),
         oldInput: req.body,
      });
   }

   try {
      const { title, content } = req.body;
      const userId = req.user.id;

      await db.insertMessage(title, content, userId);
      req.flash(
         "success",
         "Message posted! You can now view it on the home page leaderboard."
      );

      res.redirect("/dashboard"); // or wherever you show messages
   } catch (err) {
      next(err);
   }
};

////////////////////////////// Home Page ///////////////////////////////////
////////////////////////////// Home Page ///////////////////////////////////

const homePageGet = async (req, res) => {
   const rawMessages = await db.getAllMessagesWithAuthors();

   const messages = rawMessages.map((msg) => ({
      ...msg,
      authorName: msg.author_name,
      createdAtFormatted: getRelativeTime(msg.created_at),
   }));
   // console.log(messages)
   // console.log(messages);
   res.render("index", {
      messages: [],
      user: req.user,
      messages,
      errors: [],
   });
};

////////////////////////////// Delete Message ///////////////////////////////////
////////////////////////////// Delete Message ///////////////////////////////////

const messageDeletePost = async (req, res) => {
   const messageId = req.params.id;
   try {
      await db.deleteMessageById(messageId);
      res.redirect("/");
   } catch (err) {
      next(err);
   }
};

const searchMessagesGet = async (req, res) => {
   const searchTerm = req.query.searchTerm;

   try {
      // Get all messages (for fallback rendering)
      const allmessages = await db.getAllMessagesWithAuthors()
      const messagesWithTime = allmessages.map((msg)=>({
         ...msg,
         authorName: msg.author_name,
         createdAtFormatted: getRelativeTime(msg.created_at)
      }))

      // if user is not a member, return default view + error
      if (!req.user || !req.user.is_member){
         return res.render('index', {
            title: 'JKR Club',
            user:req.user,
            messages: messagesWithTime,
            errors: ["Search is members-only. Please join to unlock this feature."],
         })
      }
      // Else: perofrom the actuall search
      const results = await db.searchMessages(searchTerm)
      const formattedResults = results.map((msg)=>({
         ...msg,
         authorName: msg.author_name,
         createdAtFormatted: getRelativeTime(msg.created_at)
      }))

      res.render('index',{
         title:'JKR Club',
         user:req.user,
         messages:formattedResults,
         errors: [],
      })

   } catch (err) {
      next(err)
   }
};

////////////////////////////// EXPORTS ///////////////////////////////////
module.exports = {
   signUpGet,
   signUpPost,
   loginGet,
   loginPost,
   dashboardGet,
   logoutGet,
   joinTheClubGet,
   joinTheClubPost,
   becomeAdminGet,
   becomeAdminPost,
   createMessageGet,
   createMessagePost,
   homePageGet,
   messageDeletePost,
   searchMessagesGet,
};

// alternative of using flash errors
// passport.authenticate("local", (err, user, info) => {
//   if (err) {
//     return next(err); // real error
//   }

//   if (!user) {
//     return res.render("loginForm", {
//       title: "JKR Club",
//       oldInput: req.body,
//       errors: [{ msg: info.message }], // manual error injection
//     });
//   }

//   req.logIn(user, (err) => {
//     if (err) return next(err);
//     return res.redirect("/");
//   });
// })(req, res, next); // ← still must be invoked

// Example array structure (from server/controller)
// const messages = [
//   {
//     id: 1,
//     title: "Welcome to JKR Club",
//     content: "We’re so glad you joined!",
//     authorName: "AdminJane",
//     createdAt: new Date(),
//   },
//   ...
// ];
