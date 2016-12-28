var m = require("mithril");
var clockObserver = require("../utils/clockObserver");
var _ = require("lodash")
var util = require("../utils/util");

var clock = {
    controller: function (data) {
        let vm = this;
        vm.data = data;
        vm.note = m.prop(data.task().note || "");
        vm.validTime = m.prop(data.pomodoro().validTime || 0);
        vm.interuptCount = m.prop(data.pomodoro().interuptCount || 0);
    },
    view: function (ctrl) {
        return m(".clock", [
            m(".clock-count-down", "count down"),
            m("p", ctrl.data.task()._id),
            !_.isEmpty(ctrl.data.pomodoro()) ? m(".edit", [
                m("div", {config: function (el, init) {
                        if (!init) {
                            let interval = setInterval(() => {
                                let elapsedTime = util.elapsed(ctrl.data.pomodoro().startTime);
                                if (elapsedTime.minutes >= 25)  {
                                    el.innerHTML = `has finished`;
                                    clearInterval(interval);
                                } else {
                                    el.innerHTML = `has elapsed ${elapsedTime.formatted}`;
                                }
                            }, 1000);
                        }
                    }}, `has elapsed ${util.elapsed(ctrl.data.pomodoro().startTime).formatted}`),
                    m("textarea", {type: "text", onchange: m.withAttr('value', ctrl.note), value: ctrl.note()}),
                    m("button", {onclick: () => ctrl.data.updateNote(ctrl.data.task()._id, ctrl.note())}, "save"),
                    m("br"),
                    m("input", {type: "text", onchange: m.withAttr('value', ctrl.validTime), value: ctrl.validTime()}),
                    m("input", {type: "text", onchange: m.withAttr('value', ctrl.interuptCount), value: ctrl.interuptCount()}),
                    m("button", {onclick: () => {
                        ctrl.data.updatePomodoro(ctrl.data.task()._id, ctrl.data.pomodoro()._id, ctrl.validTime(), ctrl.interuptCount())}
                    }, "save"),

            ]): m("div", "nothing"),
        ])
    }

}

module.exports = clock;