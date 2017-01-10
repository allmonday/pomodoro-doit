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
        vm.viewPomo = (taskId, pomodoroId, e) => {
            if (vm.eachPomo.isFinished()) {
                console.log(vm.task._id())
                console.log(vm.eachPomo._id())
            }
        }
    },
    view: function (ctrl) {
        return m(".pomo-item", { 
            onclick: ctrl.viewPomo,
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
                m(".ui.vertical.labeled.icon.buttons.tiny", [  // stop pomodoro
                    m("button.ui.button", {
                        onclick: (e) => {
                            widget.service.resetPomodoro( ctrl.task._id(), ctrl.eachPomo._id())
                        } 
                    }, [
                        m("i.stop.icon"),
                        m("span", "Cancel")
                    ])
                ]):
                m("div"):  // finished
                m(".ui.vertical.labeled.icon.buttons.tiny", [  // start btn
                    m("button.ui.button", {
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
                        m("span", "Go")
                    ])
                ])
        ]);
    }
}

module.exports = timer;