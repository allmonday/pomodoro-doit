var m = require("mithril");
var clockObserver = require("./clockObserver");

var clock = {
    controller: function (data) {
        let vm = this;
        vm.data = {};
        clockObserver.subscribe((obj) => {
            vm.data.task = obj.task;
            vm.data.pomodoro = obj.pomodoro;
        });
    },
    view: function (ctrl) {
        return m(".clock", [
            m(".clock-count-down", "count down"),
            m("p", ctrl.data.task),
            m("p", ctrl.data.pomodoro)
        ])
    }

}

module.exports = clock;