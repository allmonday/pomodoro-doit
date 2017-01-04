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
        return m("#pomodoro-add.ui.form", [
            m("input[type='text'][autocomplete='off'][placeholder='enter task']#pomodoro-add-item_input", {
                oninput: m.withAttr("value", ctrl.name),
                value: ctrl.name()
            }),
            m("#pomodoro-add_buttons", [
                m("button.ui.button.orange.mini", {
                    onclick: ctrl.addToday
                },"Add Today"),
                m("button.ui.button.teal.mini", {
                    onclick: ctrl.add
                },"Add Task"),
            ])
        ]);
    }
}

module.exports = AddItem;