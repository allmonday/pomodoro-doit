"use strict";

var express = require("express");
var contact = express();
var _ = require("lodash");
var mongourl = "mongodb://localhost:27017/pomodoro"
var mongoose = require("mongoose");
mongoose.connect(mongourl);
var db = mongoose.connection;
db.once("open", function () {
    console.log('open');
    console.log
})

var Task = require("./model/task");

var todoTask = [
    {name: "a", email:"111@111.com", id: 1},
    {name: "b", email:"111@111.com", id: 2},
    {name: "c", email:"111@111.com", id: 3},
    {name: "d", email:"111@111.com", id: 4}
];

var todayTask = [
    // {name: "a", email:"111@111.com", id: 1, pomo: [
    //     {status: true},
    //     {status: false},
    //     {status: false}
    // ]},
    // {name: "b", email:"111@111.com", id: 2, pomo: [
    //     {status: true},
    //     {status: false},
    // ]},
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
    res.send(todayTask);
});

contact.post("/task/cancel", function (req, res) {
    var id = req.body.id;
    let index = _.findIndex(todoTask, {id: id});
    todoTask[index].assigned = false;
    let todayIndex = _.findIndex(todayTask, {id: id});
    todayTask.splice(todayIndex, 1);
    res.send();
})

contact.post("/today", function (req, res) {
    // sourceid. item in todo list
    // targetid. item in today list
    var receive = req.body;
    let sourceid = receive.sourceid;
    let targetid = receive.targetid;
    let isinter = receive.isinter;
    let top = receive.top;

    if (isinter) {  // internal change 
        let item = _.find(todayTask, {id: sourceid});
        let sourceindex = _.findIndex(todayTask, {id: sourceid});
        todayTask.splice(sourceindex, 1);

        let targetindex = _.findIndex(todayTask, {id: targetid});
        targetindex += (top? 0: 1);
        todayTask.splice(targetindex, 0, item);

    } else {
        let item = _.find(todoTask, {id: sourceid});
        let exist = _.findIndex(todayTask, {id: sourceid});
        if (exist !== -1) {
            console.log('already has it');
        } else {
            let originindex = _.findIndex(todoTask, {id: sourceid});
            todoTask[originindex].assigned = true;

            item.pomo = [{ status: false}];
            if (!targetid) {
                todayTask.push(item);

            } else {
                let index = _.findIndex(todayTask, {id: targetid});
                index += (top? 0: 1);
                todayTask.splice(index, 0, item);
            }
        }
    }
    res.send();
});

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