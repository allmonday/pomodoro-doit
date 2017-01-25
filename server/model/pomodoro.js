"use strict";
var mongoose = require("mongoose");

var pomodoroSchema = new mongoose.Schema({
    status: {type: Boolean, default: false },  // has start
    startTime: {type: Date , default: "", index: true},
    interuptCount: {type: Number, default: 0 } ,
    validTime: { type: Number, default: 25}
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports = pomodoroSchema;