"use strict";
var mongoose = require("mongoose");

var pomodoroSchema = new mongoose.Schema({
    status: {type: Boolean, default: false },  // has start
    startTime: {type: Date , default: ""},
    interuptCount: {type: Number, default: 0 } ,
    validTime: { type: Number, default: 25}
})

module.exports = pomodoroSchema;