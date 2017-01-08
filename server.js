var express = require("express");
var config = require("./config");
var app = express();
var bodyParser = require("body-parser");
var pomodoro = require("./server/pomodoro");
var contact = require("./server/contact");
var dnd = require("./server/dnd");
var path = require("path");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var routers = require("./server/route");
var setUpPassport = require("./server/setuppassort");
var mongourl = config.mongourl || "mongodb://localhost:27017/pomodoro";
var mongoose = require("mongoose");
mongoose.connect(mongourl);
setUpPassport();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
    secret: "tangkikodo rocks",
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(bodyParser.json())

app.use(routers);
app.use("/api/pomodoro/", pomodoro);
app.use("/api/contact/", contact);
app.use("/api/dnd/", dnd);

app.get("/page/:pageName", function (req, res) {
    res.sendfile("./views/"+ req.params.pageName +".html");
});

var server = app.listen(4000, function () {
    var host = server.address().address; 
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});