var m = require("mithril");
var moment = require("moment");
var clockObserver = require("../utils/clockObserver");
var timerObservable = require("../utils/timerObservable");
var util = require("../utils/util");
var updateClockObservable = require("../utils/updateObservable");

var timer = {
    controller: function (data) {
        let vm = this;
        vm.eachPomo = data.eachPomo;
        vm.task = data.task;
    },
    view: function (ctrl) {
        return m(".pomo-item", [
            m(".pomo-title", `finished-${ctrl.eachPomo.isFinished()}`),

            ctrl.eachPomo.hasStarted()? util.isRunning(ctrl.eachPomo.status(), ctrl.eachPomo.startTime()) ? m("div", {config: function (el, init) {
                if (!init) {
                    let interval = setInterval(() => {
                        let elapsedTime = util.elapsed(ctrl.eachPomo.startTime());
                        if (elapsedTime.minutes >= 25)  {
                            timerObservable.complete({});
                            el.innerHTML = `has finished`;
                            clearInterval(interval);
                        } else {
                            el.innerHTML = `has elapsed ${elapsedTime.formatted}`;
                        }
                    }, 1000);
                }
            }}, `has elapsed ${util.elapsed(ctrl.eachPomo.startTime()).formatted}`): m("div", "has finished!"):
            m("button", {
                disabled: !ctrl.eachPomo.runnable(),
                onclick: () => {
                    clockObserver.next({
                        taskId: ctrl.task,
                        pomodoroId: ctrl.eachPomo
                    })
                }                        // onclick: console.log.bind(null, "click")
            }, "start")
        ]);
    }
}

module.exports = timer;