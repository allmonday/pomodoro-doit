var m = require("mithril");
require("./confirm.scss");

var confirm = {
    controller: function (data) {
    },
    view: function(ctrl) {
        return m("#confirm-modal.ui.modal.basic", [
            m(".ui.icon.header", [
                m("p", "Confirm")
            ]),
            m(".content", [
                m("p", "Are you sure?")
            ]),
            m(".actions", [
                m(".ui.red.basic.cancel.inverted.button", [
                    m("i.remove.icon"),
                    m("span", "NO")
                ]),
                m(".ui.green.ok.inverted.button", [
                    m("i.checkmark.icon"),
                    m("span", "Yes")
                ])
            ])
        ])
    }
}

module.exports = confirm;