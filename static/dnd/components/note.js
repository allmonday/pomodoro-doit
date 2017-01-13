var m = require("mithril");
// var Rx = require("rxjs");
var widget = require("../app");

var note = {
    controller: function (data) {
        let vm = this;
        vm.data = data;
        vm.note = m.prop(data.task().note || "");
        vm.sending = m.prop(false);
        vm.save = (id, note) => {
            vm.sending(true);
            setTimeout(() => {
                widget.service.updateNote(vm.data.task()._id, vm.note());
                vm.sending(false);
            }, 400);
        }
    },
    view: function (ctrl) {
        return m(".pomodoro-note-main", [
            m(".ui.form", [
                m(".field", [
                    m("label", `Notes of ${ctrl.data.task().name } ( markdown supported )`),
                    m("textarea[type='text'][rows='15']#pomodoro-note-main_edit", {
                        oninput: m.withAttr('value', ctrl.note),
                        value: ctrl.note(),
                        onkeypress: function (e) {
                            if (e.keyCode == 13 && e.ctrlKey) {
                                ctrl.save(ctrl.data.task()._id, ctrl.note());
                            }
                        }
                    }),
                ]),
                m("button.ui.button.orange.mini.right.floated", {
                    class: ctrl.sending()? 'loading': '',
                    onclick: () => ctrl.save(ctrl.data.task()._id, ctrl.note())
                }, "Update (Ctrl + Enter)"),
            ])
        ])
    }
}

module.exports = note;