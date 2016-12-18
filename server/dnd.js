var express = require("express");
var contact = express();
var _ = require("lodash");

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
    res.send(todoTask.filter(function (item) {
        return !item.assigned;
    }));
});

contact.get("/today", function (req, res) {
    res.send(todayTask);
});

contact.post("/addtask", function (req, res) {
    var id = todoTask.length + 1;
    todoTask.push({
        name: req.body.name,
        email: "default@12.com",
        id: id
    })
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

            item.pomo = [];
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