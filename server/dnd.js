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
var sortList = require("./utils/sort-today");

db.once("open", function () {
    console.log('open');
})

dnd.route("/task")
    .get(function (req, res) {
        Task.find({assigned: false})
            .then(function (data) {
                res.send(data);
            })
    })
    .post(function (req, res) {
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
            }, (err) => {
                res.status(404).send(err); 
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

dnd.route("/today")
    .get(function (req, res) {
        Task.getToday()
            .then((data) => {
                data = sortList(data);
                res.send(data);
            })
    })
    .post(function(req, res) {  // logic holy sucks..
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

dnd.route("/today/pomodoro")
    .post(function (req, res) {
        let id = req.body.id;
        Task.findById(id)
            .then((task) => {
                task.pomodoros.push({})
                return task.save()
            })
            .then(() => {
                res.send();
            })
    })
    .put(function (req, res) {
        let taskid = req.body.task,
            pomoid = req.body.pomo;
        Task.findById(taskid)
            .then((task) => {
                let t = task.pomodoros.id(pomoid)
                t.startTime = new Date();
                t.status = true;
                return task.save();
            })
            .then(() => {
                res.send();
            })

    })
    .delete(function (req, res) {
        let id = req.body.id;
        Task.findById(id)
            .then((task) => {
                task.pomodoros.pop();
                return task.save();
            })
            .then(() => {
                res.send();
            })
    })

module.exports = dnd;