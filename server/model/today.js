var mongoose = require("mongoose");

var Today = mongoose.Schema({
    taskId: Schema.Types.ObjectId,
    name: String,
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

Today.virtual("id").get(function () {
    return this._id;
})
Today.set("toJSON", {
    virtuals: true
})

module.exports = mongoose.model(Today);