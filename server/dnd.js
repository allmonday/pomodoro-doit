var express = require("express");
var contact = express();
var _ = require("lodash");

var listLeft = [
    {name: "a", email:"111@111.com", id: 1},
    {name: "b", email:"111@111.com", id: 2},
    {name: "c", email:"111@111.com", id: 3},
    {name: "d", email:"111@111.com", id: 4}
];

var listRight = [
    {name: "a", email:"111@111.com", id: 1},
    {name: "b", email:"111@111.com", id: 2},
    {name: "c", email:"111@111.com", id: 3},
    {name: "d", email:"111@111.com", id: 4}
];


contact.get("/left", function (req, res) {
    res.send(listLeft);
});

contact.get("/right", function (req, res) {
    res.send(listRight);
});

contact.post("/right", function (req, res) {
    // sourceid. item in todo list
    // targetid. item in today list
    var receive = req.body;
    let sourceid = receive.sourceid;
    let targetid = receive.targetid;
    let isinter = receive.isinter;
    let top = receive.top;
    console.log(sourceid, targetid, top);

    if (isinter) {  // internal change 
        let item = _.find(listRight, {id: sourceid});
        let sourceindex = _.findIndex(listRight, {id: sourceid});
        listRight.splice(sourceindex, 1);

        let targetindex = _.findIndex(listRight, {id: targetid});
        targetindex += (top? 0: 1);
        listRight.splice(targetindex, 0, item);

    } else {
        let item = _.find(listLeft, {id: sourceid});
        let exist = _.findIndex(listRight, {id: sourceid});
        if (exist !== -1) {
            console.log('already has it');
        } else {
            if (!targetid) {
                listRight.push(item);

            } else {
                let index = _.findIndex(listRight, {id: targetid});
                index += (top? 0: 1);
                listRight.splice(index+ top? 0: 1, 0, item);
            }

        }


    }

    res.send();
});

module.exports = contact;