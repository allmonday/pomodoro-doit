var m = require("mithril");
var moment = require("moment");
var timerObservable = require("../utils/timerObservable");
var util = require("../utils/util");
var widget = require("../app");

require("./timer.scss");

var timer = {
    controller: function (data) {
        let vm = this;
        vm.eachPomo = data.eachPomo;
        vm.task = data.task;
        vm.statusText = m.prop("running...");
        vm.data = data;
    },
    view: function (ctrl) {
        return m(".pomo-item", { 
            class: ctrl.eachPomo.isFinished() ? "on-hover": ""
        },[
            m(".tomato.infinite.pulse", {
                class: ctrl.eachPomo.isRunning() ? 'animated': ''
            }, [
                ctrl.eachPomo.isFinished() ? 
                    m("img[src='/imgs/tomato-complete.svg'].pomodoro-today-list_display_img"):
                    m("img[src='/imgs/tomato.svg'].pomodoro-today-list_display_img"),
            ]),

            ctrl.eachPomo.hasStarted()? util.isRunning(ctrl.eachPomo.status(), ctrl.eachPomo.startTime()) ? 
                m(".pomo-item_start", [  // stop pomodoro
                    m("button.tiny.icon.circular.ui.button", {
                        onclick: (e) => {
                            widget.service.resetPomodoro( ctrl.task._id(), ctrl.eachPomo._id())
                        } 
                    }, [
                        m("i.stop.icon"),
                    ])
                ]):
                m("div"):  // finished
                m(".pomo-item_start", [  // start btn
                    m("button.icon.tiny.circular.ui.button", {
                        class: !ctrl.eachPomo.runnable()? "hide": "",
                        // disabled: !ctrl.eachPomo.runnable(),
                        onclick: (e) => {
                            widget.service.startTimer({
                                taskId: ctrl.task,
                                pomodoroId: ctrl.eachPomo
                            })
                        } 
                    }, [
                        m("i.play.icon"),
                    ])
                ])
        ]);
    }
}

module.exports = timer;