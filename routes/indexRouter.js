// routes\indexRouter.js

const { Router } = require("express");
const indexController = require("../controllers/indexController");
const validateUser = require("../validators/validateUser");
const validateLogin = require("../validators/validateLogin")
const validateMessage = require('../validators/validateMessage')
const { ensureAuthenticated, ensureAdmin, ensureMember } = require("../middleware/auth");
const router = Router();

// Auth
router.get("/signup",  indexController.signUpGet);
router.post("/signup", validateUser, indexController.signUpPost);
router.get("/login",  indexController.loginGet);
router.post("/login", validateLogin, indexController.loginPost);

// Protected
router.get('/dashboard', ensureAuthenticated ,indexController.dashboardGet)

// Membership & Admin routes
router.get('/join-the-club',ensureAuthenticated, indexController.joinTheClubGet)
router.post('/join-the-club',ensureAuthenticated, indexController.joinTheClubPost)
router.get('/become-admin', ensureAuthenticated,indexController.becomeAdminGet)
router.post('/become-admin', ensureAuthenticated,indexController.becomeAdminPost)

// Logout
router.get("/logout", indexController.logoutGet);

// Create Message
router.get('/create-message',ensureAuthenticated, indexController.createMessageGet)
router.post('/create-message',ensureAuthenticated, validateMessage ,indexController.createMessagePost)

// Delete Message
router.post("/delete-message/:id", ensureAdmin, indexController.messageDeletePost);

// Search Messages
router.get('/search',indexController.searchMessagesGet)

// Home Page
router.get('/',indexController.homePageGet)

module.exports = router;
