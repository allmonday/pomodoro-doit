function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "you must be logged in to see this page");
        res.redirect("/login");
    }
}

module.exports = ensureAuthenticated;