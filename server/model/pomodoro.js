"use strict";
var mongoose = require("mongoose");


var pomodoroSchema = new mongoose.Schema({
    status: {type: Boolean, default: false },
    startTime: {type: Date , default: Date.now},
    interuptCount: {type: Number, default: 0 } ,
    validTime: { type: Number, default: 0}
})

module.exports = pomodoroSchema;