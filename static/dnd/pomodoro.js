var m = require("mithril");
var clockObserver = require("./clockObserver");
var moment = require("moment");

function elapsed(date) {
   return moment().diff(date, 'minute'); 
}
var pomo = {
    controller: function (data) {
        let vm = this;
        vm.task = data.item;
        vm.start = data.start;
    },
    view: function (ctrl) {
        return m(".pomo", [
            ctrl.task.pomodoros().map(function (item) {
                return m(".pomo-item", [
                    m(".pomo-title", `clock-${item.status()}`),
                    m(".pomo-title", `clock-${item.startTime()}`),
                    m(".pomo-title", `finished-${item.isFinished()}`),

                    item.hasStarted()? m("div", `has elapsed ${elapsed(item.startTime())} minutes`): 
                    m("button", {
                        onclick: () => {
                            ctrl.start(ctrl.task._id(), item._id());
                            clockObserver.next({
                                task: ctrl.task._id(),
                                pomodoro: item._id()
                            })
                        }                        // onclick: console.log.bind(null, "click")
                    }, "start")
                ]);
            })
        ])
    }
}

module.exports = pomo;