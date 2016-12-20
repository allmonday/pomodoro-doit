var mongoose = require("mongoose");

var Task = mongoose.Schema({
    name: String,
    note: String,
    createTime: Date,
    updateTime: Date,
    assigned: Boolean,
})

module.exports = Task;