var m = require("mithril");
require("./add.scss");

var AddItem = {
    controller: function (data) {
        let vm = this;
        vm.name = m.prop("");
        vm.add = () => {
            data.addHandler(vm.name());
            vm.name("");
        }
        vm.addToday = () => {
            data.addTodayHandler(vm.name());
            vm.name("");
        }
    }, 

    view: function (ctrl) {
        return m("#pomodoro-add.ui.mini.form", [
            m("input[type='text'][autocomplete='off']#pomodoro-add-item_input", {
                onchange: m.withAttr("value", ctrl.name),
                value: ctrl.name()
            }),
            m("#pomodoro-add_buttons", [
                m("button.ui.button.primary", {
                    onclick: ctrl.add
                },"Add Task"),
                m("button.ui.button.orange", {
                    onclick: ctrl.addToday
                },"Add Today"),

            ])
        ]);
    }
}

module.exports = AddItem;