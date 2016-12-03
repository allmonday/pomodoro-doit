var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.set("views", "./views");
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/page/1", function (req, res) {
    res.sendfile("./views/component.html");
});

var list = [
    {name: "1", email:"111@111.com", id: 1},
    {name: "2", email:"111@111.com", id: 2},
    {name: "3", email:"111@111.com", id: 3},
]

app.get("/api/contact", function (req, res) {
    res.send(list);
});

app.post("/api/contact", function (req, res) {
    var recive = req.body;
    recive.id = 1;
    list.push(recive);
    res.send();
});

var server = app.listen(3000, function () {
    var host = server.address().address; 
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);
});