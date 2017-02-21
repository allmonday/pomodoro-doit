var m = require("mithril");
var util = require("../utils/util");
var widget = require("../app");

require("./clock.scss");


var clock = {
    controller: function (data) {

        util.log("clock init");
        let vm = this;
        vm.data = data;
        vm.validTime = m.prop(data.pomodoro().validTime || 0);
        vm.interuptCount = m.prop(data.pomodoro().interuptCount || 0);
        vm.timeFormatted = m.prop("...");
        vm.progress = m.prop("");
        vm.percent = m.prop("0");
        vm.getPct = util.getPct;

        function callRestModal () {
            setTimeout(() => {
                widget.service.refreshRestClock()
                $("#rest-modal.ui.basic.modal").modal("show");
                window.removeEventListener('focus', callRestModal);
            }, 1000);
        }

        function count() {
            if (typeof vm.data.pomodoro().startTime === "undefined") {
                return;
            }

            let elapsedTime = util.elapsed(vm.data.pomodoro().startTime);
            if (elapsedTime.minutes < widget.service.user().range())  {
                document.title = `${elapsedTime.reversedFormattedForTitle} ${vm.data.task().name}`
                if (!window.blurred) {
                    util.log("trigger count");
                    vm.progress(`width: ${elapsedTime.percent}%;`);
                    vm.percent(elapsedTime.percent);
                    vm.timeFormatted(elapsedTime.reversedFormatted);
                    m.redraw();
                }

            } else {

                vm.progress("width: 100%;");
                vm.timeFormatted('has finished');

                document.title = util.title;
                $("#notice-voice")[0].play();

                if (window.blurred) {
                    util.notifyMe(vm.data.task().name);
                }
                widget.service.init();

                if (window.blurred) {
                    window.addEventListener('focus', callRestModal);
                } else {
                    callRestModal();
                }

            }
        }

        if (!_.isEmpty(vm.data.pomodoro())) {
            // util.timerWorker.onmessage = (e) => { count();}
            util.timerWorker.onmessage = count;
        } else {
            util.timerWorker.onmessage = () => {}
        }
    },
    view: function (ctrl) {
        return m(".pomodoro-clock", [
            !_.isEmpty(ctrl.data.pomodoro()) ? m(".pomodoro-clock_view", [
                m(".pomodoro-clock_view_progress", [
                    m("#pomodoro-pct", {
                        'data-pct': ctrl.timeFormatted() 
                    }, [
                        m("svg[width='200'][height='200'][viewPort='0 0 100 100'].pomodoro-clock-circle", [
                            m("circle[r='90'][cx='100'][cy='100'][fill='transparent'][stroke-dasharray='565.48'][stroke-dashoffset='0']", {
                            }),
                            m(`circle[id="bar"][r="90"][cx="100"][cy="100"][fill="transparent"][stroke-dasharray="565.48"][stroke-dashoffset="0"][transform=rotate(270, 100, 100)]`,{
                                style: `stroke-dashoffset: ${ctrl.getPct(ctrl.percent())}px;`
                            })
                        ])
                    ]),
                ]),
            ]): m(".pomodoro-clock_empty", [
                m(".pomodoro-clock-banner", [
                    m(".ui.message.compact", {
                        style: "text-align: left;"
                    }, [
                        m("p", "1. create a todo task (today task)"),
                        m("p", "2. drag todo task into today task area"),
                        m("p", "3. adjust count of pomodoro (max 10)"),
                        m("p", "4. click play to start your pomodoro, enjoy"),
                        m("p", "*. use #tag# syntax to create tags for the task"),
                    ]),

                ])
            ]),
        ])
    }
}

module.exports = clock;