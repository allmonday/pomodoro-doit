"use strict";

var config = require("../config");
var q = require("q");
var express = require("express");
var dnd = express();
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

dnd.get("/task", function (req, res) {
    Task.find({assigned: false})
        .then(function (data) {
            res.send(data);
        })
});

dnd.post("/addtask", function (req, res) {
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

dnd.get("/today", function (req, res) {
    Task.getToday()
        .then((data) => {
            data = sortList(data);
            res.send(data);
        })
});

dnd.post("/task/cancel", function (req, res) {
    let currentid = req.body.id;

    Task.findById(currentid)
        .then((item) => {
            let nextNode = item.nextNode;

            if (item.isHead && item.nextNode) {  // if element is head element, set nextNode isHead true
                return Task.update({_id: nextNode }, {$set: { isHead: true }});
            } else {  // if element is not head element, find prevNode use nextNode, set it's nextNode;
                return Task.update({nextNode: currentid}, {$set: { nextNode: nextNode }});
            }
        })
        .then(() => {  // clear task
            return Task.update({_id: req.body.id}, {$set: { 
                date: "", 
                assigned: false, 
                isHead: false, 
                nextNode: "" 
            }});
        })
        .then(() => { res.send() });
});

dnd.post("/today", function(req, res) {  // logic holy sucks..
    let sourceid = req.body.sourceid,
        targetid = req.body.targetid,
        isinter = req.body.isinter;

    if (!isinter) {  // move from unassigned

        if (!targetid) {  // insert at head
            Task.find({date: todayGetter(), isHead: true})
                .then((items) => { 
                    // assume today is empty
                    let varable = {
                        date: todayGetter(), 
                        assigned: true,
                        isHead: true,
                    }

                    if (items.length === 0) { // today is empty
                        return Task.update({_id: sourceid}, { $set: varable });

                    } else { // today already has other head.

                        let originHead = items[0]._id;
                        varable.nextNode = originHead;
                        return q.all([
                            Task.update({_id: sourceid}, {$set: varable}),
                            Task.update({_id: originHead}, {$set: { isHead: false }})
                        ])
                    }

                })
                .then(() => {
                    res.send();
                })

        } else {  // insert at other
            Task.findById(targetid)
                .then((target) => { return q.when(target.nextNode); })
                .then((nextNode) => {
                    return Task.update({_id: req.body.sourceid}, 
                                {$set: { 
                                    date: todayGetter(), 
                                    assigned: true,
                                    isHead: !targetid,
                                    nextNode: nextNode
                                }})
                })
                .then(() => {
                    return !targetid ? 
                        q.when():
                        Task.update({_id: req.body.targetid}, {$set: { nextNode: sourceid}});
                })
                .then(() => { res.send() });
        }

    } else {  // move from internal
        if (sourceid === targetid) {  // no change
            return res.send();
        } else {
            Task.findById(sourceid) // pick source
                .then((source) => {

                    if (source.isHead && !source.nextNode) {  // only one element, no change
                        // return res.send();
                        throw "no operation";
                    }

                    if (source.isHead) { // is source head
                        // set next one ishead: true, set self isHead false
                        return q.all([
                            Task.update({_id: source.nextNode}, {$set: {isHead: true}}),
                            Task.update({_id: sourceid}, {$set: {isHead: false}}),
                        ]);
                    }

                    if (!source.nextNode) { // is last one
                        // set prev one nextNode: ""
                        return Task.update({ nextNode: sourceid }, {$set: {nextNode: ""}})
                    } 

                    return Task.update({nextNode: sourceid}, {$set: { nextNode: source.nextNode }}); // other: set prev one nextNode nextNode 
                    
                })
                .then(()=>{

                    if (!targetid) { // is head? (targetid === null)
                        console.log("is head");
                        Task.findOne({date: todayGetter(), isHead: true})
                            .then((first) => {
                                return q.all([
                                    Task.update({_id: first._id}, {$set: {isHead: false}}),
                                    Task.update({_id: sourceid}, {$set: {isHead: true, nextNode: first._id}})// set isHead, nextNode, clear origin isHead false
                                ])
                            }).then(() => {
                                res.send();
                            })

                    } else {
                        // insert into target
                        Task.findById(targetid)
                            .then((target) => {
                                if (!target.nextNode) { // is last one?
                                    return q.all([
                                        Task.update({_id: targetid}, {$set: {nextNode: sourceid}}),
                                        Task.update({_id: sourceid}, {$set: {nextNode: ""}})
                                    ]) // set target's nextNode, set nextNode ""
                                }
                                // other
                                return q.all([
                                    Task.update({_id: targetid}, {$set: {nextNode: sourceid}}),
                                    Task.update({_id: sourceid}, {$set: {nextNode: target.nextNode}})
                                ]); // set target's nextNode, set nextNode -> next
                            })
                            .then(() => {
                                res.send();
                            })

                    }

                })
                .catch(()=>{
                    res.send();
                })

        }


    }
})

// dnd.post("/today", function (req, res) {
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

dnd.post("/today/add", function (req, res) {
    var receive = req.body;
    let id = receive.id;
    let index = _.findIndex(todayTask, {id: id});
    todayTask[index].pomo.push({status: false});
    res.send();
})

dnd.post("/today/sub", function (req, res) {
    var receive = req.body;
    let id = receive.id;
    let index = _.findIndex(todayTask, {id: id});
    todayTask[index].pomo.pop();
    res.send();
})

module.exports = dnd;