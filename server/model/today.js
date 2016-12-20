var mongoose = require("mongoose");

var Today = mongoose.Schema({
    taskId: Schema.Types.ObjectId,
    note: String,
    createTime: Date,
    updateTime: Date,
    pomodoros: [{
        status: Boolean,
        startTime: Date,
        interuptCount: Number,
        validTime: Number
    }]
})

module.exports = Today;