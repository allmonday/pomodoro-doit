"use strict";

var config = require("../config");
var q = require("q");
var express = require("express");
var contact = express();
var _ = require("lodash");
var mongourl = config.mongourl || "mongodb://localhost:27017/pomodoro";
var mongoose = require("mongoose");
mongoose.connect(mongourl);
var db = mongoose.connection;
var todayGetter = require("./utils/today");
var Task = require("./model/task");
var Today = require("./model/today");
var sortList = require("./utils/sort-today");

db.once("open", function () {
    console.log('open');
})


var todoTask = [
    {name: "a", email:"111@111.com", id: 1},
    {name: "b", email:"111@111.com", id: 2},
    {name: "c", email:"111@111.com", id: 3},
    {name: "d", email:"111@111.com", id: 4}
];

var todayTask = [
];

contact.get("/task", function (req, res) {
    Task.find({assigned: false})
        .then(function (data) {
            res.send(data);
        })
});

contact.post("/addtask", function (req, res) {
    var task = new Task({
        name: req.body.name,
        note: "",
        createTime: new Date(),
        updateTime: new Date(),
        assigned: false
    })
    task.save()
        .then((data) => {
            res.send();
        })
})

contact.get("/today", function (req, res) {
    Task.getToday()
        .then((data) => {
            // console.log(data);
            data = sortList(data);
            // console.log(data);
            res.send(data);
        })
});

contact.post("/task/cancel", function (req, res) {
    Task.update({_id: req.body.id}, {$set: {  assigned: false }})
        .then(() => { res.send() });
});

contact.post("/today", function(req, res) {
    let sourceid = req.body.sourceid,
        targetid = req.body.targetid;

    Task.update({_id: req.body.sourceid}, 
                {$set: { 
                    date: todayGetter(), 
                    assigned: true,
                    isHead: !targetid,
                }})
        .then(() => {
            return !targetid ? 
                q.when():
                Task.update({_id: req.body.targetid}, {$set: { nextNode: sourceid}});
        })
        .then(() => { res.send() });
})

// contact.post("/today", function (req, res) {
//     // sourceid. item in todo list
//     // targetid. item in today list
//     var receive = req.body;
//     let sourceid = receive.sourceid;
//     let targetid = receive.targetid;
//     let isinter = receive.isinter;
//     let top = receive.top;

//     if (isinter) {  // internal change 
//         let item = _.find(todayTask, {id: sourceid});
//         let sourceindex = _.findIndex(todayTask, {id: sourceid});
//         todayTask.splice(sourceindex, 1);

//         let targetindex = _.findIndex(todayTask, {id: targetid});
//         targetindex += (top? 0: 1);
//         todayTask.splice(targetindex, 0, item);
//         res.send();

//     } else { // move from task

//         q.all([
//             Task.findById(sourceid),
//             Today.getToday()
//         ]).then((data) => {
//             let task = data[0],
//                 today = data[1],
//                 todayTasks = today.tasks;
//             let exist = _.findIndex(todayTasks, {id: sourceid});
//             if (exist !== -1) {
//                 console.log('alread has it');
//             } else {
//                 // update task  
//                 Task.update({_id: sourceid}, { $set: { assigned: true }}).exec();

//                 var saveItem = {
//                     taskId: sourceid,
//                     name: task.name,
//                     note: task.note,
//                     createTime: task.createTime,
//                     updateTime: task.updateTime,
//                     pomodoros: [{
//                         status: false,
//                         startTime: new Date(),
//                         interuptCount: 0,
//                         validTime: 0
//                     }]
//                 }

//                 if( !targetid) {
//                     todayTasks.push(saveItem);

//                 } else {
//                     let index = _.findIndex(todayTasks, {taskId: targetid});
//                     index += (top ? 0: 1);
//                     todayTasks.splice(index, 0, saveItem);
//                 }
//                 let todayString = todayGetter();
//                 Today.update({date: todayString}, { $set: { tasks: todayTasks }}).exec();
//             }
//             return res.send();
//         })
//     }
// });

contact.post("/today/add", function (req, res) {
    var receive = req.body;
    let id = receive.id;
    let index = _.findIndex(todayTask, {id: id});
    todayTask[index].pomo.push({status: false});
    res.send();
})

contact.post("/today/sub", function (req, res) {
    var receive = req.body;
    let id = receive.id;
    let index = _.findIndex(todayTask, {id: id});
    todayTask[index].pomo.pop();
    res.send();
})

module.exports = contact;