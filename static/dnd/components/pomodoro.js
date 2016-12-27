var m = require("mithril");
var clockObserver = require("../utils/clockObserver");
var moment = require("moment");
var timer = require("./timer");

var pomo = {
    controller: function (data) {
        let vm = this;
        vm.task = data.item;
    },
    view: function (ctrl) {
        return m(".pomo", [
            ctrl.task.pomodoros().map(function (eachPomo) {
                return m(timer, {
                    eachPomo: eachPomo, 
                    task: ctrl.task,
                    key: JSON.stringify(eachPomo)
                })
            })
        ])
    }
}

module.exports = pomo;