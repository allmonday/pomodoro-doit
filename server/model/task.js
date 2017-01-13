"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var todayString = require("../utils/today").today;
var pomodoroSchema = require("./pomodoro");

var Task = mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: String, default: ""},
    name: { type: String, required: true},
    note: String,
    fixedTop: { type: Boolean, default: false},   // keep on top
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
    finished: {type: Boolean, default: false }, 
    assigned: { type: Boolean, default: false },
    prevNode: { type: String, default: ""},
    nextNode: { type: String, default: ""},
    isHead: {type: Boolean, default: false },
    pomodoros: [
        pomodoroSchema
    ]
})

Task.static("getToday", function (date) {
    var today = date ? date: todayString();
    return this.find({date: today, assigned: true });
});

Task.static("getTodayByUser", function (date, user) {
    var today = date ? date: todayString();
    return this.find({date: today, assigned: true, user: user });
})

// Task.virtual("id").get(function () {
//     return this._id;
// })
// Task.set("toJSON", {
//     virtuals: true
// })

var model;
try {
    model = mongoose.model('Task', Task);
} catch (e) {
    console.log("tasks oops");
    model = mongoose.model('Task');
}

module.exports = model;