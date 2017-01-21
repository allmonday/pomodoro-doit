var m = require("mithril");
var widget = require("../app");
var markdown = require("markdown").markdown;
require("./note.scss");

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
    view: function (vm) {
        return m(".pomodoro-note-main.ui.modal.fullscreen", [
            m(".header", [
                m("p[style='font-weight: normal;']", `Notes of ${vm.data.task().name } ( markdown supported )`),
            ]),
            m(".content.ui.container", [
                m(".ui.grid.two.column", [
                    m(".ui.column.pomodoro-note-main_preview", [
                        m(".preview", "Preview"),
                        m(".preview-content", m.trust(markdown.toHTML(vm.note())))
                    ]),
                    m(".ui.form.column.pomodoro-note-main_editor", [
                        m(".field", [
                            m("textarea[type='text'][rows='25']#pomodoro-note-main_edit", {
                                oninput: m.withAttr('value', vm.note),
                                value: vm.note(),
                                onkeypress: function (e) {
                                    if (e.keyCode == 13 && e.ctrlKey) {
                                        vm.save(vm.data.task()._id, vm.note());
                                        e.preventDefault(); 
                                    }
                                }
                            }),

                        ])
                    ])

                ])
            ]),
            m(".actions", [
                m("button.ui.button.orange.mini.right", {
                    class: vm.sending()? 'loading': '',
                    onclick: () => vm.save(vm.data.task()._id, vm.note())
                }, "Update (Ctrl + Enter)"),

            ])
        ])
    }
}

module.exports = note;