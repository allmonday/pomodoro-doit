// pomodoro server~

var express = require("express");
var mongoose = require("mongoose");
// register models
require("./server/utils/connect");
require("./server/model/register");
var app = express();
var bodyParser = require("body-parser");
var pomodoro = require("./server/pomodoro");
var contact = require("./server/contact");
var dnd = require("./server/dnd");
var path = require("path");
var cookieParser = require("cookie-parser");
var passport = require("passport")
var session = require("express-session");
var flash = require("connect-flash");
var routers = require("./server/route");
var setUpPassport = require("./server/setuppassort");
setUpPassport();


var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const MongoStore = require("connect-mongo")(session);

app.set("views", "./views");
app.set("view engine", "ejs");


app.use(express.static("static"));

app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser())

app.use(session({
    secret: "tangkikodo",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(flash());

app.use(bodyParser.json())

app.use(passport.initialize());

app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.session.flash.error; // only fix, dont know why req.flash not works
    res.locals.infos = req.session.flash.info;
    // res.locals.errors = req.flash("error");
    // res.locals.infos = req.flash("info");
    next();
});

app.use(routers);
app.use("/api/pomodoro/", pomodoro);
app.use("/api/contact/", contact);
app.use("/api/dnd/", dnd);


app.get("/app/pomodoro", ensureLoggedIn("/login") ,function (req, res) {
    res.render('mithril-dnd');
})

app.get("/app/:pageName", function (req, res) {
    res.render(req.params.pageName);
});

if(!module.parent) {
    var server = app.listen(4000, function () {
        var host = server.address().address; 
        var port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
    });
}


module.exports = app;
