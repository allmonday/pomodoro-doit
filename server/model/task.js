"use strict";
var mongoose = require("mongoose");
var todayString = require("../utils/today");
var pomodoroSchema = require("./pomodoro");

var Task = mongoose.Schema({
    date: { type: String, default: ""},
    name: { type: String, required: true},
    note: String,
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
    assigned: Boolean,
    prevNode: { type: String, default: ""},
    nextNode: { type: String, default: ""},
    isHead: {type: Boolean, default: false },
    pomodoros: [
        pomodoroSchema
    ]
})

Task.static("getToday", function () {
    var today = todayString();
    return this.find({date: today, assigned: true });
})

// Task.virtual("id").get(function () {
//     return this._id;
// })
// Task.set("toJSON", {
//     virtuals: true
// })

module.exports = mongoose.model('Task', Task);