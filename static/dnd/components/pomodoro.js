var m = require("mithril");
var util = require("../utils/util");
var widget = require("../app");

require("./timer.scss");

function choose(key, obj) {
    return obj[key];
}

var pomo = {
    controller: function (data) {
        util.log("pomodoro init");
        let vm = this;
        vm.task = data.today;
    },
    view: function (vm) {
        return m(".pomo", [
            vm.task.pomodoros().map(function (pomodoro) {
                return m(".pomo-item", { 
                    key: pomodoro._id(),
                    class: pomodoro.isFinished() ? "on-hover": ""
                },[
                    m(".tomato.infinite.pulse", {
                        class: pomodoro.isRunning() ? 'animated': ''
                    }, [
                        pomodoro.isFinished() ? 
                            m("img[src='/imgs/tomato-complete.svg'].pomodoro-today-list_display_img"):
                            m("img[src='/imgs/tomato.svg'].pomodoro-today-list_display_img"),
                    ]),

                    choose(pomodoro.currentStatus(), {
                        prepare: 
                            m(".pomo-item_start", [  // start btn
                                m("button.icon.tiny.orange.circular.ui.button", {
                                    class: !pomodoro.runnable()? "hide": "",
                                    onclick: (e) => {
                                        widget.service.startTimer({
                                            taskId: vm.task,
                                            pomodoroId: pomodoro
                                        })
                                    } 
                                }, [ m("i.play.icon"), ])
                            ]),

                        running: 
                            m(".pomo-item_start", [  // stop pomodoro
                                m("button.tiny.icon.circular.ui.button", {
                                    onclick: (e) => {
                                        widget.service.resetPomodoro( vm.task._id(), pomodoro._id())
                                    } 
                                }, [ m("i.stop.icon"), ])
                            ]),

                        finished: m("div"),
                    }),
                ]);
            })
        ])
    }
}

module.exports = pomo;