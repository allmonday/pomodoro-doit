"use strict";

var config = require("../config");
var q = require("q");
var express = require("express");
var dnd = express();
var _ = require("lodash");
var mongoose = require("mongoose");
var Task = mongoose.model("Task");
var User = mongoose.model("User");
var todayString = require("./utils/today").today;
var yesterdayGetter = require("./utils/today").yesterday;
var sortList = require("./utils/sort-today");
var ensureAuthenticated = require("./utils/ensureAuthenticated");
// var log = console.log;
var log = function () {};

// all api/dnd is login-required
dnd.all('/*',ensureAuthenticated);

dnd.route("/task")
    .get(function (req, res) {
        // Task.find({$or: [
        //             {assigned: false, user: req.user._id},   // unassigned task
        //             {assigned: true, date: yesterdayGetter(), user: req.user._id}   // 
        //         ]})
        Task.find({assigned: false, user: req.user._id})
            .sort({assigned: -1, fixedTop: -1})
            .then(function (data) {
                res.send(data);
            })
    })
    .put(function (req, res) {
        var taskId = req.body._id;
        var note = req.body.note;
        var name = req.body.name;
        var fixedTop = req.body.fixedtop;

        var updateObj = {};

        if (note) {
            updateObj.note = note;
        }
        if (name) {
            updateObj.name = name;
        }
        if (typeof fixedTop === 'boolean') {
            updateObj.fixedTop = fixedTop;
        }

        Task.update({_id: taskId}, {$set: updateObj })
            .then(() => { 
                res.send();
            });
    })
    .post(function (req, res) {
        Task.count({assigned: false, user: req.user._id}).then((count) => {
            if (count >= 20) {
                return res.status(400).send({error: 'exceed limit of todo'});

            } else {
          
                let prevNode = req.body.prevNode;
                if (!req.body.name) {
                    return res.status(400).send({error: 'name is empty'});
                }

                if (typeof prevNode === "undefined") {  // just create task 
                    var task = new Task({
                        name: req.body.name,
                        note: "",
                        pomodoros: [{}],
                        createTime: new Date(),
                        updateTime: new Date(),
                        user: req.user,
                    })
                    task.save()
                        .then((data) => {
                            res.send({status: 'success'});
                        }, (err) => {
                            res.status(400).send(err); 
                        });
                } else if (prevNode === null) {  // if today's task is empty
                    var task = new Task({
                        name: req.body.name,
                        note: "",
                        assigned: true,
                        isHead: true,
                        pomodoros: [{}],
                        date: todayString(),
                        createTime: new Date(),
                        updateTime: new Date(),
                        user: req.user,
                    })
                    task.save().then((data) => { res.send({status: 'success'}); })

                } else {  // append to today tasks
                    var task = new Task({
                        name: req.body.name,
                        note: "",
                        date: todayString(),
                        assigned: true,
                        pomodoros: [{}],
                        createTime: new Date(),
                        updateTime: new Date(),
                        user: req.user
                    })
                    task.save()
                        .then((data) => {
                            return Task.update({_id: prevNode}, {$set: {nextNode: data._id}})
                        }).then(() =>{
                            res.send({status: 'success'});
                        })
                }

            }
        })
    })
    .delete(function (req, res) {
        Task.remove({_id: req.body._id})
            .then(() => {
                res.send();
            })
    })

dnd.route("/today")
    .get(function (req, res) {
        Task.getTodayByUser(req.query.date, req.user)
            .then((data) => {
                try {
                    data = sortList(data);
                    res.send(data);
                } catch(e) {
                    res.status(400).send(e);
                }
            }, (err) => {
                res.status(400).send(err);
            })
    })
    .post(function(req, res) {  // logic holy sucks..
        let sourceid = req.body.sourceid,
            targetid = req.body.targetid,
            isinter = req.body.isinter;
        Task.getTodayTotal(null, req.user).then((count) => {
            if (count >= 20 && !isinter)  {
                return res.status(400).send({error: 'exceed limit of today'});
            } else {
                        /* from todo -> today */
                if (!isinter) { 
                    if (!targetid) {  // try to insert at head
                        Task.find({date: todayString(), isHead: true})
                            .then((items) => { 
                                // assume today is empty
                                let varable = {
                                    date: todayString(), 
                                    assigned: true,
                                    isHead: true,
                                }

                                if (items.length === 0) { // today is empty, insert at head;
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
                                                date: todayString(), 
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


                } else {  
                    /* move from internal */
                    if (sourceid === targetid) {  // no change
                        return res.send();
                    } else {
                        let source;
                        Task.findById(sourceid) // pick source out
                            .then((sourceData) => {
                                source = sourceData;
                                if (source.isHead && !source.nextNode && source.date !== todayString()) {  // only one element, no change
                                    log("lonley head")
                                    return q.when();  // go to next step, clean itself
                                }

                                if (source.isHead && !source.nextNode) {  // only one element, no change
                                    // return res.send();
                                    throw "no operation";
                                }

                                if (source.isHead) { // is source head
                                    // set next one ishead: true, set self isHead false
                                    log("is head")
                                    return q.all([
                                        Task.update({_id: source.nextNode}, {$set: {isHead: true}}),
                                        Task.update({_id: sourceid}, {$set: {isHead: false}}),
                                    ]);
                                }

                                if (!source.nextNode) { // is last one
                                    log("is end")
                                    // set prev one nextNode: ""
                                    return Task.update({ nextNode: sourceid }, {$set: {nextNode: ""}})
                                } 

                                log("between")
                                return Task.update({nextNode: sourceid}, {$set: { nextNode: source.nextNode }}); // other: set prev one nextNode nextNode 
                                
                            })
                            .then(() => {   // clean yesterday item.
                                if (source.date !== todayString()) { // from yesterday
                                    log("from yesterday")
                                    return Task.update({ _id: sourceid}, {$set: { date: todayString(), isHead: false }}); // if drag yester task into today, date should be overwriten
                                } else {
                                    log("ignore");
                                    return q.when();
                                }
                            })
                            .then(()=>{
                                if (!targetid) { // is head? (targetid === null)
                                    Task.findOne({date: todayString(), isHead: true})
                                        .then((first) => {
                                            if (first) {
                                                return q.all([
                                                    Task.update({_id: first._id}, {$set: {isHead: false}}),
                                                    Task.update({_id: sourceid}, {$set: {isHead: true, nextNode: first._id}})// set isHead, nextNode, clear origin isHead false
                                                ])
                                            } else {
                                                return Task.update({_id: sourceid}, {$set: {isHead: true, nextNode: ''}}) // set isHead
                                            }
                                        }).then(() => {
                                            res.send();
                                        })

                                } else {
                                    // insert into target
                                    Task.findById(targetid)
                                        .then((target) => {
                                            if (!target.nextNode) { // is last one?
                                                log("insert end");
                                                return q.all([
                                                    Task.update({_id: targetid}, {$set: {nextNode: sourceid}}),
                                                    Task.update({_id: sourceid}, {$set: {nextNode: ""}})
                                                ]) // set target's nextNode, set nextNode ""
                                            }
                                            // other
                                            log("insert between");
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
                        .catch((err)=>{
                            res.status(400).send(err);
                        })
                }
            }

            }
        })   

    })
    .delete(function (req, res) {
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



dnd.route("/today/pomodoro/state")
    .post(function (req, res) {  // start pomodoro
        let taskid = req.body.taskId,
            pomodoroId = req.body.pomodoroId;
        Task.findById(taskid)
            .then((task) => {
                let t = task.pomodoros.id(pomodoroId)
                t.startTime = new Date();
                t.status = true;
                return task.save();
            })
            .then(() => {
                res.send();
            })

    })
    .put(function (req, res) {   // cancel , and reset pomorodo
        let taskId = req.body.taskId,
            pomodoroId = req.body.pomodoroId;
        Task.findById(taskId)
            .then((task) => {
                let t = task.pomodoros.id(pomodoroId);
                t.status = false;
                t.startTime = null;
                return task.save();
            })
            .then(() => {
                res.send();
            })
    })

dnd.route("/today/pomodoro")
    .post(function (req, res) {  // add pomodoro
        let id = req.body.id;
        Task.findById(id)
            .then((task) => {
                if (task.pomodoros.length < 5) {
                    task.pomodoros.push({})
                    return task.save()
                } else {
                    return q.when();
                }
            })
            .then(() => {
                res.send();
            })
    })
    .put(function (req, res) {  // start pomodoro
        let taskId = req.body.taskId,
            pomodoroId = req.body.pomodoroId,
            validTime = req.body.validTime,
            interuptCount = req.body.interuptCount;
        Task.findById(taskId)
            .then((task) => {
                let t = task.pomodoros.id(pomodoroId);
                t.validTime = validTime;
                t.interuptCount = interuptCount;
                return task.save();
            })
            .then(() => {
                res.send();
            })
    })
    .delete(function (req, res) {  // delete pomodoro
        let id = req.body.id;
        Task.findById(id)
            .then((task) => {
                if (task.pomodoros.length === 1) {
                    return q.when();
                }

                let last = task.pomodoros[task.pomodoros.length - 1];
                if (last.status) {
                    return q.when();
                } else {
                    task.pomodoros.pop();
                    return task.save();
                }
            })
            .then(() => {
                res.send();
            })
    })

module.exports = dnd;