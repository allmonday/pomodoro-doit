var m = require("mithril");
var moment = require("moment");
var clockObserver = require("../utils/clockObserver");
var timerObservable = require("../utils/timerObservable");
var util = require("../utils/util");

function elapsed(date) {
    let minutes = moment().diff(date, 'minute'); 
    let seconds = moment().diff(date, 'second');
    seconds = seconds - 60 * minutes;
    return {
        formatted: `${minutes} minutes and ${seconds} seconds`,
        minutes: minutes,
    }
}

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
                        let elapsedTime = elapsed(ctrl.eachPomo.startTime());
                        if (elapsedTime.minutes >= 25)  {
                            timerObservable.complete({});
                            el.innerHTML = `has finished`;
                            clearInterval(interval);
                        } else {
                            el.innerHTML = `has elapsed ${elapsedTime.formatted}`;
                        }
                    }, 1000);
                }
            }}): m("div", "has finished!") :
            m("button", {
                disabled: !ctrl.eachPomo.runnable(),
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