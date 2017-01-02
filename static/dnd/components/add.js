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
    }, 

    view: function (ctrl) {
        return m("#pomodoro-add.ui.form", [
            m("input[type='text']#pomodoro-add-item_input", {
                onchange: m.withAttr("value", ctrl.name),
                value: ctrl.name()
            }),
            m("button.ui.button.primary", {
                onclick: ctrl.add
            },"Add"),
        ]);
    }
}

module.exports = AddItem;