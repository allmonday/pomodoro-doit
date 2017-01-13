function authenRedirect(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/app/pomodoro");
    } else {
        next();
    }
}

module.exports = authenRedirect;