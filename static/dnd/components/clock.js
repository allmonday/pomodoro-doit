var m = require("mithril");
var _ = require("lodash")
var util = require("../utils/util");
require("./clock.scss");

function notifyMe() {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Notification title', {
      icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: `pomodoro finished! take a break`,
    });
  }
}

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

        if (!_.isEmpty(vm.data.pomodoro())) {
            let interval = setInterval(() => {
                let elapsedTime = util.elapsed(vm.data.pomodoro().startTime);
                if (elapsedTime.minutes >= 25)  {
                    vm.progress("width: 100%;");
                    vm.timeFormatted('has finished');
                    clearInterval(interval);
                } else {
                    vm.progress(`width: ${elapsedTime.percent}%;`);
                    vm.percent(elapsedTime.percent);
                    vm.timeFormatted(elapsedTime.formatted);
                }
                m.redraw();
            }, 1000);
        }
    },
    view: function (ctrl) {
        return m(".pomodoro-clock", [
            !_.isEmpty(ctrl.data.pomodoro()) ? m(".pomodoro-clock_view", [
                m(".pomodoro-clock_view_progress", [
                    m(".pomodoro-clock_progress.ui.progress.orange",[
                        m(".bar", {style: ctrl.progress()})
                    ]),
                    m(".ui.label.large", ctrl.timeFormatted()),
                    m(".ui.label.large", `${Math.floor(ctrl.percent())}%`),
                ]),
                m(".ui.form", {style: 'overflow: hidden;'}, [
                    m(".field", [
                        m("label", "valid time"),
                        m("input[type='number'][max='25'][min='0']", {oninput: m.withAttr('value', ctrl.validTime), value: ctrl.validTime()}),

                    ]),
                    m(".field", [
                        m("label", "interupt count"),
                        m("input[type='number'][max='3'][min='0']", {oninput: m.withAttr('value', ctrl.interuptCount), value: ctrl.interuptCount()}),
                    ]),
                    m("button.ui.button.mini.orange.right.floated", {onclick: () => {
                        ctrl.data.updatePomodoro(ctrl.data.task()._id, ctrl.data.pomodoro()._id, ctrl.validTime(), ctrl.interuptCount())}
                    }, "update"),
                ]),
                m(".ui.form", [
                    m(".field", [
                        m("label", "Notes(markdown available)"),
                        m("textarea", {type: "text", oninput: m.withAttr('value', ctrl.note), value: ctrl.note()}),
                    ]),
                    m("button.ui.button.orange.mini.right.floated", {onclick: () => ctrl.data.updateNote(ctrl.data.task()._id, ctrl.note())}, "update"),
                ])
            ]): m("h2", "select a pomodoro to start!"),
        ])
    }
}

module.exports = clock;