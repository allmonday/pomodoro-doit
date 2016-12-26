var m = require("mithril");
var moment = require("moment");
var clockObserver = require("../utils/clockObserver");

function elapsed(date) {
   return moment().diff(date, 'second'); 
}

var timer = {
    controller: function (data) {
        let vm = this;
        vm.eachPomo = data.eachPomo;
        vm.task = data.task;
        vm.elapsedTime;

        vm.refresh = function () {
            setTimeout(() => {
                m.startComputation(); //call before everything else in the event handler
                vm.elapsedTime = elapsed(vm.eachPomo.startTime());
                m.endComputation(); //call after everything else in the event handler
                vm.refresh();
            }, 1000);
        };
        if (vm.eachPomo.hasStarted()) {
            vm.refresh();
        }
    },
    view: function (ctrl) {
        return m(".pomo-item", [
            m(".pomo-title", `clock-${ctrl.eachPomo.status()}`),
            m(".pomo-title", `clock-${ctrl.eachPomo.startTime()}`),
            m(".pomo-title", `finished-${ctrl.eachPomo.isFinished()}`),

            ctrl.eachPomo.hasStarted()? m("div", `has elapsed ${ctrl.elapsedTime} minutes`): 
            m("button", {
                onclick: () => {
                    clockObserver.next({
                        taskId: ctrl.task._id(),
                        pomodoroId: ctrl.eachPomo._id()
                    })
                }                        // onclick: console.log.bind(null, "click")
            }, "start")
        ]);
    }
}

module.exports = timer;