var express = require("express");
var contact = express();


var list = [
    {name: "1", email:"111@111.com", id: 1},
    {name: "2", email:"111@111.com", id: 2},
    {name: "3", email:"111@111.com", id: 3},
];

contact.get("/", function (req, res) {
    res.send(list);
});

contact.post("/", function (req, res) {
    var recive = req.body;
    recive.id = 1;
    list.push(recive);
    res.send();
});

module.exports = contact;