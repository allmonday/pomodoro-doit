var express = require("express");
var today = require("./utils/today").today;
var pomodoro = express();

var SCHEDULED = 0;
var WORKING = 1;
var FINISHED = 2;


var task = [
    { id: 0, name: "task 1", completed: SCHEDULED , date: "", clocks: [], note: ""},
    { id: 1, name: "task 2", completed: WORKING, date: "2016-12-4", clocks: [
        {
            validTime: "",
            interuptCount: 0,
            start: "8:21",
        },
        {
            validTime: "",
            interuptCount: 0,
            start: "",
        },
        {
            validTime: "",
            interuptCount: 0,
            start: "",
        },
    ], note: ""},
    { id: 2, name: "task 3", completed: FINISHED , date: "2016-12-4", clocks: [
        {
            validTime: "22",
            interuptCount: 1,
            start: "12:00",
        },
    ], note: ""},
    { id: 3, name: "task 4", completed: SCHEDULED , date: "", clocks: [], note: ""},
    { id: 4, name: "task 5", completed: WORKING , date: "2016-12-4", clocks: [
        {
            validTime: "23",
            interuptCount: 1,
            start: "14:00",
        },
    ], note: ""},
];


pomodoro.get("/task", function (req, res) {
    res.send(task.filter(function(item) {
        return item.completed == SCHEDULED || item.completed == WORKING; 
    }).filter(function (item) {
        return item.date !== today();
    }));
});

pomodoro.post("/task", function (req, res) {
    res.send();
});

pomodoro.get("/today", function (req, res) {
    res.send(task.filter(function (item){
        return item.completed == WORKING;
    }));
});


module.exports = pomodoro;