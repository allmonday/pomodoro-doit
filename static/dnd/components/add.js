var m = require("mithril");
require("./add.scss");

var AddItem = {
    controller: function (data) {
        let vm = this;
        vm.name = m.prop("");
        vm.add = (e) => {
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
                oninput: m.withAttr("value", ctrl.name),  // sync content
                config: (el, init) => {  // enter to add item
                    if (!init) {
                        el.addEventListener("keypress", function (e) {
                            if (e.keyCode === 13) { ctrl.add(); }
                        })
                    }
                },
                value: ctrl.name()
            }),
            m("#pomodoro-add_buttons", [
                m("button.ui.button.orange.mini", {
                    onclick: ctrl.addToday
                },"Add to Today"),
                m("button.ui.button.teal.mini", {
                    onclick: ctrl.add
                },"Add to Task"),
            ])
        ]);
    }
}

module.exports = AddItem;