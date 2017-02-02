"use strict";

var express = require("express");
var ensureAuthenticated = require("./utils/ensureAuthenticated");

var diary = express();

diary.all("/*", ensureAuthenticated);

diary.route("/note")
    .get(function (req, res) {
        res.send([])
    })
    .put(function (req, res) {
        res.send({})
    })
