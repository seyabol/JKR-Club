const express = require("express");
const path = require("path");
const indexRouter = require("./routes/indexRouter");
const passport = require("./config/passportConfig"); // ← loads strategy
const sessionMiddleware = require("./config/sessionConfig"); // ← session setup
const flash = require('connect-flash')

const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const staticpath = path.join(__dirname, "public");
app.use(express.static(staticpath));
app.use(express.urlencoded({ extended: true })); // req.body


// 🔐 Session + Flash + Passport middleware
app.use(sessionMiddleware);
app.use(flash()); // TODO: check how you can remove it
app.use(passport.initialize());
app.use(passport.session());

// 🧪 Debug
app.use((req, res, next) => {
  // console.log("SESSION:", req.session);
  // console.log("USER:", req.user);
  next();
});

app.use("/", indexRouter);

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  let status = err.status || 500;
  let message = err.message || "Something went wrong.";

  if (err.code === "23505") {
    status = 400;
    message = err.detail + ` in table ${err.table.toUpperCase()}`;
  }

  res.status(status).render("partials/errors", { errors: [message] }); // or send JSON
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});
