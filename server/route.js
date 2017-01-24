var express = require("express");
var mongoose = require("mongoose");
var User = mongoose.model("User");

var router = express.Router();
var passport = require("passport");
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
var authenRedirect = require("./utils/authenRedirect");
var ensureAuthenticated = require("./utils/ensureAuthenticated");

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

router.get("/user/profile", ensureLoggedIn("/"), function (req, res) {
    res.render("profile");
})

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
        messages: messages || []
    });
});

router.post("/signup", function (req, res, next) {
    var PASSWORD_REG = /^(\w){6,20}$/;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    if (!PASSWORD_REG.test(password)) {
        req.flash("error", "Password invalid")
        return res.redirect("/signup");
    }
    if (!validateEmail(email)) {
        req.flash("error", "Email invalid")
        return res.redirect("/signup")
    }

    User.findOne({ username: username }, function (err, user) {
        if (err) { return next(err); }
        if (user) {
            req.flash("error", "User already exists");
            return res.redirect("/signup");
        }
        var newUser = new User({
            username: username,
            password: password,
            email: email
        });
        newUser.save(next);
    });
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));

router.post("/user/password", ensureAuthenticated, function (req, res) {
    var PASSWORD_REG = /^(\w){6,20}$/;
    var password = req.body.new;
    if (!PASSWORD_REG.test(password)) {
        return res.status(400).send({ error: "password invalid"});
    }
    console.log("save it")
    User.findById(req.user._id).then(user => {
        user.email = user.email || "default@default.com";
        user.password = password;
        return user.save();
    }).then(() => {
        console.log("success");
        res.send({ success: true})
    }, (err) => {
        console.error(err);
        res.status(400).send(err);
    })
})


router.get("/", authenRedirect, function (req, res, next) {
    var messages = req.flash("error")
    res.render("index", {
        messages: messages || []
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