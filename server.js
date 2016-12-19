var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var pomodoro = require("./server/pomodoro");
var contact = require("./server/contact");
var dnd = require("./server/dnd");

app.set("views", "./views");
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use("/api/pomodoro/", pomodoro);
app.use("/api/contact/", contact);
app.use("/api/dnd/", dnd);

app.get("/page/:pageName", function (req, res) {
    res.sendfile("./views/"+ req.params.pageName +".html");
});

var server = app.listen(3000, function () {
    var host = server.address().address; 
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);
});