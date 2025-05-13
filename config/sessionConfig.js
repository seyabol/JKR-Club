// config/sessionConfig.js
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("../db/connectionPool");

module.exports = session({
   secret: process.env.SESSION_SECRET || "dev_secret",
   resave: false,
   saveUninitialized: true,
   store: new pgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
   }),
   cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
   },
});
