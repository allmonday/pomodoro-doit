"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var todayString = require("../utils/today").today;

var Diary = mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: String, default: "", index: true},
    content: { type:String },
    createTime: { type: Date, default: Date.now },
    tags: [
        { type: String }
    ]
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports = Diary;