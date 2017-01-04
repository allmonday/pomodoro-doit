var express = require("express");
var User = require("./model/user");
var router = express.Router();
var passport = require("passport");

router.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
})

router.get("/signup", function (req, res) {
    res.render("signup");
});

router.post("/signup", function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

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

router.get("/", function (req, res, next) {
    console.log("called");
    User.find()
        .sort({ createdAt: "descending" })
        .exec(function (err, users) {
            if (err) { return next(err); }
            res.render("index", { users: users });
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