var mongoose = require("mongoose");
var todayGetter = require("../utils/today");

var Today = mongoose.Schema({
    date: String,
    tasks: [
        {
            taskId: String,
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
        }
    ],
})
Today.static('getToday', function () {
    var today = todayGetter();
    return this.findOne({date: today});
})

// Today.virtual("id").get(function () {
//     return this._id;
// })
// Today.set("toJSON", {
//     virtuals: true
// })

// var mongourl = "mongodb://localhost:27017/pomodoro"
// var mongoose = require("mongoose");
// mongoose.connect(mongourl);

TodayModel = mongoose.model('Today', Today);

// var today = new TodayModel({
//     date: '20161201',
//     tasks: [
//         {
//             taskId: "5858e27ae61b9d991242d0e8",
//             name: "task",
//             note: "",
//             craeteTime: new Date(),
//             updateTime: new Date(),
//             pomodoros: [
//                 { 
//                     status: false, 
//                     startTime: new Date(),
//                     interuptCount: 1,
//                     validTime: 21
//                 },
//             ]
//         },
//         {
//             taskId: "5858e27ae61b9d991242d0e8",
//             name: "task",
//             note: "",
//             craeteTime: new Date(),
//             updateTime: new Date(),
//             pomodoros: [
//                 { 
//                     status: false, 
//                     startTime: new Date(),
//                     interuptCount: 1,
//                     validTime: 22
//                 },
//             ]
//         }
//     ]
// })

// today.save();

module.exports = TodayModel;