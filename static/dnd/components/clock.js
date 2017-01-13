var m = require("mithril");
var util = require("../utils/util");
var widget = require("../app");
// var _ = require("lodash");

require("./clock.scss");

var clock = {
    controller: function (data) {
        let vm = this;
        vm.data = data;
        vm.validTime = m.prop(data.pomodoro().validTime || 0);
        vm.interuptCount = m.prop(data.pomodoro().interuptCount || 0);
        vm.timeFormatted = m.prop("...");
        vm.progress = m.prop("");
        vm.percent = m.prop("0");
        vm.getPct = getPct;

        function getPct(val) {
            var r = 90;
            var c = Math.PI*(r*2);
        
            if (val < 0) { val = 0;}
            if (val > 100) { val = 100;}
            
            var pct = (val/100)*c;
            return pct;
        }

        function count() {
            m.startComputation();
            let elapsedTime = util.elapsed(vm.data.pomodoro().startTime);
            if (elapsedTime.minutes >= 25)  {
                vm.progress("width: 100%;");
                vm.timeFormatted('has finished');
                util.notifyMe(vm.data.task().name);
                widget.service.init();
            } else {
                vm.progress(`width: ${elapsedTime.percent}%;`);
                vm.percent(elapsedTime.percent);
                vm.timeFormatted(elapsedTime.reversedFormatted);
                setTimeout(count, 1000);
            }
            m.endComputation();
        }

        if (!_.isEmpty(vm.data.pomodoro())) {
            count();
        }
    },
    view: function (ctrl) {
        return m(".pomodoro-clock", [
            !_.isEmpty(ctrl.data.pomodoro()) ? m(".pomodoro-clock_view", [
                m(".pomodoro-clock_view_progress", [
                    // m(".pomodoro-clock_progress.ui.progress.orange",[
                    //     m(".bar", {style: ctrl.progress()}, [
                    //         m(".progress", `${Math.floor(ctrl.percent())}%`),
                    //     ])
                    // ]),
                    // m(".ui.label.huge.orange", ctrl.timeFormatted()),
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
                m(".ui.form", {style: 'overflow: hidden;'}, [
                    m(".two.fields", [
                        m(".field", [
                            m("label", "valid time"),
                            m("input[type='number'][max='25'][min='0']", {oninput: m.withAttr('value', ctrl.validTime), value: ctrl.validTime()}),

                        ]),
                        m(".field", [
                            m("label", "interupt count"),
                            m("input[type='number'][max='3'][min='0']", {oninput: m.withAttr('value', ctrl.interuptCount), value: ctrl.interuptCount()}),
                        ]),
                    ]),
                    m("button.ui.button.mini.orange.right.floated", {onclick: () => {
                        ctrl.data.updatePomodoro(ctrl.data.task()._id, ctrl.data.pomodoro()._id, ctrl.validTime(), ctrl.interuptCount())}
                    }, "update"),
                ])
            ]): m(".pomodoro-clock_empty", [
                // m(".ui.large.top.left.attached.label.orange.pomodoro-clock-new", "Select a pomodoro to start!"),
                m(".pomodoro-clock-banner", [
                    m("img[src='/imgs/tomato.svg'].pomodoro-clock-icon"),
                    m("h2.pomodoro-clock-title", "Pomodoro-DOIT!"),
                    m(".ui.message.compact", "Todolist-like Pomodoro clock!")

                ])
            ]),
        ])
    }
}

module.exports = clock;