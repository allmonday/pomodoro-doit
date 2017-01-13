var express = require("express");
var mongoose = require("mongoose");
var User = mongoose.model("User");

var router = express.Router();
var passport = require("passport");
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
var authenRedirect = require("./utils/authenRedirect");

router.get("/edit", ensureLoggedIn("/login"), function (req, res) {
    res.render("edit");
})

router.post("/edit", ensureLoggedIn("/login"), function (req, res, next) {
    req.user.displayName = req.body.displayName;
    req.user.bio = req.body.bio;
    req.user.save(function (err) {
        if (err) {
            next(err); return;
        }
        req.flash("info", "Profile updated");
        res.redirect("/edit");
    })
})

router.get("/login", function (req, res) {
    res.render("index");
})

router.post("/login", passport.authenticate("login", {
    successReturnToOrRedirect: "/app/pomodoro",
    failureRedirect: "/",
    failureFlash: true
}))

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
})

router.get("/signup", function (req, res) {
    var messages = req.flash("error");
    res.render("signup", {
        messages: messages
    });
});

router.post("/signup", function (req, res, next) {
    var PASSWORD_REG = /^(\w){6,20}$/;
    var username = req.body.username;
    var password = req.body.password;
    if (!PASSWORD_REG.test(password)) {
        req.flash("error", "Password invalid")
        return res.redirect("/signup");
    }

    User.findOne({ username: username }, function (err, user) {
        if (err) { return next(err); }
        if (user) {
            req.flash("error", "User already exists");
            return res.redirect("/signup");
        }
        var newUser = new User({
            username: username,
            password: password
        });
        newUser.save(next);
    });
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));

router.get("/", authenRedirect, function (req, res, next) {
    var messages = req.flash("error") || [];
    res.render("index", {
        messages: messages
    });
});

router.get("/users/:username", function  (req, res, next) {
    User.findOne({ username: req.params.username }, function (err, user) {
        if (err) { return next(err); }
        if (!user) { return next(404); }
        res.render("profile", { user: user });
    });
});

module.exports = router;