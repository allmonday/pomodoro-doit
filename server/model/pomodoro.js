"use strict";
var mongoose = require("mongoose");


var pomodoroSchema = new mongoose.Schema({
    status: {type: String},
    startTime: Date,
    interuptCount: Number,
    validTime: Number
})

module.exports = pomodoroSchema;