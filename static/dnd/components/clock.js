var m = require("mithril");
var clockObserver = require("../utils/clockObserver");
var _ = require("lodash")
var util = require("../utils/util");
require("./clock.scss");

function notifyMe() {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Notification title', {
      icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: "Hey there! You've been notified!",
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
    },
    view: function (ctrl) {
        return m(".pomodoro-clock", [
            // m("p", ctrl.data.task()._id),
            !_.isEmpty(ctrl.data.pomodoro()) ? m(".pomodoro-clock_view", [
                m(".pomodoro-clock_progress.ui.progress.orange.small",[
                    m(".bar", { config: function (el, init) {
                        if (!init) {
                            let interval = setInterval(() => {
                                let elapsedTime = util.elapsed(ctrl.data.pomodoro().startTime);
                                if (elapsedTime.minutes >= 25)  {
                                    el.style = "width: 100%;"
                                    clearInterval(interval);
                                    notifyMe();
                                } else {
                                    el.style = `width: ${elapsedTime.percent}%;`
                                }
                            }, 1000);
                        }
                    }}, [])
                ]),
                m("h2", {config: function (el, init) {
                        if (!init) {
                            let interval = setInterval(() => {
                                let elapsedTime = util.elapsed(ctrl.data.pomodoro().startTime);
                                if (elapsedTime.minutes >= 25)  {
                                    el.innerHTML = `has finished`;
                                    clearInterval(interval);
                                } else { el.innerHTML = `has elapsed ${elapsedTime.formatted}, ${Math.floor(elapsedTime.percent)}%`; }
                            }, 1000);
                        }
                    }}, ""),
                m(".ui.form", {style: 'overflow: hidden;'}, [
                    m(".field", [
                        m("label", "valid time"),
                        m("input[type='number'][max='25'][min='0']", {onchange: m.withAttr('value', ctrl.validTime), value: ctrl.validTime()}),

                    ]),
                    m(".field", [
                        m("label", "interupt count"),
                        m("input[type='number'][max='3'][min='0']", {onchange: m.withAttr('value', ctrl.interuptCount), value: ctrl.interuptCount()}),
                    ]),
                    m("button.ui.button.mini.primary.right.floated", {onclick: () => {
                        ctrl.data.updatePomodoro(ctrl.data.task()._id, ctrl.data.pomodoro()._id, ctrl.validTime(), ctrl.interuptCount())}
                    }, "update"),
                ]),
                m(".ui.form", [
                    m(".field", [
                        m("label", "Notes"),
                        m("textarea", {type: "text", onchange: m.withAttr('value', ctrl.note), value: ctrl.note()}),
                    ]),
                    m("button.ui.button.primary.mini.right.floated", {onclick: () => ctrl.data.updateNote(ctrl.data.task()._id, ctrl.note())}, "update"),
                ])
            ]): m("h2", "select a pomodoro to start!"),
        ])
    }
}

module.exports = clock;