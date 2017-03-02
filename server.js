// pomodoro server~

var manifest = require("./webpack-assets.json");
var express = require("express");
var mongoose = require("mongoose");
// register models
require("./server/utils/connect");
require("./server/model/register");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var bodyParser = require("body-parser");
var pomodoro = require("./server/pomodoro");
var contact = require("./server/contact");
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

app.locals.manifest = manifest;

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
    try {
        res.locals.errors = req.session.flash.error; // only fix, dont know why req.flash not works
    } catch (e) {
        // console.error(e);
    }
    try {
        res.locals.infos = req.session.flash.info;
    } catch (e) {
        // console.error(e);
    }
    // res.locals.errors = req.flash("error");
    // res.locals.infos = req.flash("info");
    next();
});

app.use(function (req, res, next) {
    res.io = io;
    next();
});

app.use(routers);
app.use("/api/pomodoro/", pomodoro);
app.use("/api/contact/", contact);

app.get("/app/pomodoro", ensureLoggedIn("/") ,function (req, res) {
    res.render('mithril-dnd');
})

app.get("/app/diary", ensureLoggedIn("/"), function (req, res) {
    res.render('diary')
})

io.on("connection", function (socket) {
    socket.on("refresh", function (roomName) {
        socket.broadcast.to(roomName).emit("refresh-broadcast");
    })
    socket.on("join", function (roomName) {
        socket.join(roomName);
    })
})

if(!module.parent) {
    var _server = server.listen(4000, function () {
        var host = _server.address().address; 
        var port = _server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
    });
}


module.exports = app;
