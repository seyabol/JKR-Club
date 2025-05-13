// middleware/auth.js
function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) return next();
   res.redirect("/login");
}

function ensureAdmin(req, res, next) {
   if (req.isAuthenticated() && req.user.is_admin) return next();
   res.status(403).render("partials/errors", { message: "Admin access only." });
}

function ensureMember(req, res, next) {
   if (req.isAuthenticated() && req.user.is_member) return next();
   res.status(403).render("partials/errors", { errors: ["Members only."] });
}

module.exports = {
   ensureAuthenticated,
   ensureAdmin,
   ensureMember,
};
