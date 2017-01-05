var m = require("mithril");
var moment = require("moment");
var clockObserver = require("../utils/clockObserver");
var timerObservable = require("../utils/timerObservable");
var util = require("../utils/util");

require("./timer.scss");

var timer = {
    controller: function (data) {
        let vm = this;
        vm.eachPomo = data.eachPomo;
        vm.task = data.task;
        vm.statusText = m.prop("running...");
        vm.data = data;

        if(vm.eachPomo.hasStarted() && util.isRunning(vm.eachPomo.status(), vm.eachPomo.startTime())) {
            let interval = setInterval(() => {
                let elapsedTime = util.elapsed(vm.eachPomo.startTime());
                if (elapsedTime.minutes >= 25)  {
                    timerObservable.complete({});
                    vm.statusText(`has finished`);
                    clearInterval(interval);
                } else {
                    vm.statusText(`running...`);
                }
                m.redraw();
            }, 1000);
        }

    },
    view: function (ctrl) {
        return m(".pomo-item", [
            m(".tomato.infinite.pulse", {
                class: ctrl.eachPomo.isRunning() ? 'animated': ''
            }, [
                ctrl.eachPomo.isFinished() ? 
                    m("img[src='/imgs/tomato-complete.svg'].pomodoro-today-list_display_img"):
                    m("img[src='/imgs/tomato.svg'].pomodoro-today-list_display_img"),
            ]),

            ctrl.eachPomo.hasStarted()? util.isRunning(ctrl.eachPomo.status(), ctrl.eachPomo.startTime()) ? 
                m(".ui.vertical.labeled.icon.buttons.tiny", [  // stop pomodoro
                    m("button.ui.button", {
                        onclick: (e) => {
                            ctrl.data.resetPomodoro( ctrl.task._id(), ctrl.eachPomo._id())
                        } 
                    }, [
                        m("i.stop.icon"),
                        m("span", "Cancel")
                    ])
                ]):
                m("div", "Finished"):  // finished
                m(".ui.vertical.labeled.icon.buttons.tiny", [  // start btn
                    m("button.ui.button", {
                        disabled: !ctrl.eachPomo.runnable(),
                        onclick: (e) => {
                            ctrl.data.startHandler({
                                taskId: ctrl.task,
                                pomodoroId: ctrl.eachPomo
                            })
                        } 
                    }, [
                        m("i.play.icon"),
                        m("span", "Start")
                    ])
                ])
        ]);
    }
}

module.exports = timer;