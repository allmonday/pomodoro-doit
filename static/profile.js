var m = require("mithril");
var todo = require("./dnd/model/todo");
require("./profile.scss");

var binds = function (prop) {
    return { oninput: m.withAttr('value', prop), value: prop() };
}

var profile = {};

profile.controller = function (data) {
    let vm = this;
    vm.newPassword = m.prop("");
    vm.newPassword2 = m.prop("");
    vm.updatePassword = function () {
        if (vm.newPassword().length < 6) {
            alert("error")
            return false;
        }
        if (vm.newPassword() !== vm.newPassword2()) {
            alert("error");
            return false;
        }
        m.request({ method: 'post', url: '/user/password', data: { new: vm.newPassword() }})
            .then(() => location.href = '/app/pomodoro')
        return false;
    }
    vm.user = todo.user();
    vm.updateRange = function () {
        var range = vm.user().range();
        todo.updateRange(range).then(() => {
            window.location.reload();
        })
    }
}

profile.view = function (vm) {
    return m(".ui.grid", [
        m(".eight.wide.column", [
            m(".ui.segment", [
                m(".ui.label.attached.left.top", "Reset password"),
                m("form.ui.form", [
                    m(".field", [
                        m("label", "new password"),
                        m("input[name='new'][type='password']", binds(vm.newPassword))
                    ]),
                    m(".field", [
                        m("label", "new password again"),
                        m("input[name='new2'][type='password']", binds(vm.newPassword2))
                    ]),
                    m(".field", [
                        m("button.ui.button", {
                            onclick: vm.updatePassword
                        }, "update")
                    ])
                ])
            ])
        ]),
        m(".eight.wide.column", [
            m(".ui.segment", [
                m(".ui.label.attached.left.top", "set range (for each pomodoro)"),
                m("form.ui.form", [
                    m(".field", [
                        m("label", "range (minute)"),
                        m("input[name='range'][type='number'][min='10'][max='60'][step='5']", binds(vm.user().range))
                    ]),
                    m(".field", [
                        m("button.ui.button", {
                            onclick: vm.updateRange
                        }, "update")
                    ])
                ])
            ])
        ])
    ])
}

m.mount(document.querySelector("#pomodoro-profile"), profile);
