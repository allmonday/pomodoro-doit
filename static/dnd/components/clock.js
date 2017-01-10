var m = require("mithril");
var _ = require("lodash")
var util = require("../utils/util");
var widget = require("../app");
var Rx = require("rxjs");


require("./clock.scss");

var clock = {
    controller: function (data) {
        let vm = this;
        vm.data = data;
        vm.note = m.prop(data.task().note || "");
        vm.validTime = m.prop(data.pomodoro().validTime || 0);
        vm.interuptCount = m.prop(data.pomodoro().interuptCount || 0);
        vm.timeFormatted = m.prop("...");
        vm.progress = m.prop("");
        vm.percent = m.prop("0");

        vm.noteObservable = new Rx.Subject();
        vm.noteObservable.debounceTime(1000).subscribe((data) => {
            widget.service.updateNote(vm.data.task()._id, vm.note())
        });

        function count() {
            m.startComputation();
            let elapsedTime = util.elapsed(vm.data.pomodoro().startTime);
            if (elapsedTime.minutes >= 25)  {
                vm.progress("width: 100%;");
                vm.timeFormatted('has finished');
                console.log("triggered");
                util.notifyMe(vm.data.task().name);
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
                    m(".pomodoro-clock_progress.ui.progress.orange",[
                        m(".bar", {style: ctrl.progress()}, [
                            m(".progress", `${Math.floor(ctrl.percent())}%`),
                        ])
                    ]),
                    m(".ui.label.huge.orange", ctrl.timeFormatted()),
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
                ]),
                m(".ui.form", [
                    m(".field", [
                        m("label", "Notes(markdown available)"),
                        m("textarea[type='text']", {
                            oninput: m.withAttr('value', ctrl.note),
                            value: ctrl.note(),
                            config: function (el, init) {
                                if (!init) {
                                    el.addEventListener('input', function (e) {
                                        ctrl.noteObservable.next(e);
                                    })
                                }
                            }
                        }),
                    ])
                    // m("button.ui.button.orange.mini.right.floated", {
                    //     onclick: () => widget.service.updateNote(ctrl.data.task()._id, ctrl.note())
                    // }, "update"),
                ])
            ]): m(".pomodoro-clock_empty", [
                m(".ui.large.top.left.attached.label.orange.pomodoro-clock-new", "Select a pomodoro to start!"),
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