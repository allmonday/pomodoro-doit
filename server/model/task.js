var mongoose = require("mongoose");

var Task = mongoose.Schema({
    name: String,  // name is editable
    note: String,
    createTime: Date,
    updateTime: Date,
    assigned: Boolean,
})
// Task.virtual("id").get(function () {
//     return this._id;
// })
// Task.set("toJSON", {
//     virtuals: true
// })

module.exports = mongoose.model('Task', Task);