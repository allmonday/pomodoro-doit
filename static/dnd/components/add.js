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
        return m(".add-item", [
            m("input[type='text'].add-item_input", {
                onchange: m.withAttr("value", ctrl.name),
                value: ctrl.name()
            }),
            m("button.add-item_submit", {
                onclick: ctrl.add
            },"add"),
        ]);
    }
}

module.exports = AddItem;