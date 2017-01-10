var m = require("mithril");
var moment = require("moment");
var timer = require("./timer");

var pomo = {
    controller: function (data) {
        let vm = this;
        vm.task = data.item;
        vm.data = data;
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