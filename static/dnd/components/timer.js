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
        vm.statusText = m.prop("...");
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
			m("img[src='/imgs/tomato.svg'].pomodoro-today-list_display_img"),

            ctrl.eachPomo.hasStarted()? util.isRunning(ctrl.eachPomo.status(), ctrl.eachPomo.startTime()) ? 
                m("div", ctrl.statusText()):   // running
                m("div", "Finished"):  // finished
                m(".ui.vertical.labeled.icon.buttons.tiny", [  // start btn
                    m("button.ui.button", {
                        disabled: !ctrl.eachPomo.runnable(),
                        onclick: (e) => {
                            console.log(ctrl.task._id())
                            console.log(e.target);
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