var m = require("mithril");
var moment = require("moment");
var clockObserver = require("../utils/clockObserver");
var timerObservable = require("../utils/timerObservable");

function elapsed(date) {
   return moment().diff(date, 'minute'); 
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

            ctrl.eachPomo.hasStarted()? m("div", {config: function (el, init) {
                if (!init) {
                    let interval = setInterval(() => {
                        let elapsedTime = elapsed(ctrl.eachPomo.startTime());
                        if (elapsedTime <= 25)  {
                            el.innerHTML = `has elapsed ${elapsedTime} minutes`;
                        } else {
                            timerObservable.next({});
                            el.innerHTML = `has finished`;
                            clearInterval(interval);
                        }
                    }, 1000);
                }
            }}, `has elapsed ${elapsed(ctrl.eachPomo.startTime())} minutes`): 
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