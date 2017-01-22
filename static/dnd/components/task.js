var m = require("mithril");
var todo = require("../model/todo");
var widget = require("../app");

var task = {
    controller: function (data) {
        let vm = this;
        vm.task = data.task;
        vm.offset = data.offset;
        vm.sending = m.prop(false);
        vm.pin = (e) => {
            vm.sending(true);
            setTimeout(() => {
                vm.task.fixedTop(!vm.task.fixedTop());
                widget.service.updatePinTask(vm.task._id(), vm.task.fixedTop());
                vm.sending(false);
            }, 400);
        }
        
        vm.save = (e) => {
            $(e.target).blur();
            vm.sending(true);
            setTimeout(() => {
                widget.service.updateName(vm.task._id(), vm.task.name())
                vm.sending(false);
            }, 400);
        }
    },
    view: function (vm) {
        return m(".pomodoro-task_item.ui.segment", {
            class: `${vm.task.fixedTop() ? 'teal': ''} ${ vm.task.assigned()? 'assigned': ''} ${vm.sending()? 'loading': ''}`,
            draggable: vm.offset() === 0,
            ondragstart: widget.service.dragstart.bind(vm, vm.task)
        },[
            // m("p.pomodoro-task_item-content", {
            // }, `${vm.task.assigned()? '( yesterday )': ''} ${vm.task.name()}`),

            /* editable content */
            m(".pomodoro-task_item-content", {
                draggable: false
            }, [
                m("input.pomodoro-task_item-content-edit", {
                    oninput: m.withAttr('value', vm.task.name), 
                    value: vm.task.name(),
                    onkeypress: (e) => {
                        if (e.keyCode === 13) {
                            vm.save(e);
                        }
                    }
                })
            ]),
            m(".pomodoro-task_item_tags", [
                vm.task.tags().map(item => {
                    return m("span.pomodoro-task_item_tag", item);
                })
            ]),

            /* pin */
            m("i.pomodoro-task_item-content-pin.pin.icon", {
                class: vm.task.fixedTop()? 'fixed': '',
                onclick: vm.pin
            }),

            /* remove */
            m(".ui.labels.circular", [
                m(".ui.label.pomodoro-task_item-content_delete", {
                    onclick: () => { widget.service.removeTask(vm.task._id()) }
                }, [
                    m("i.remove.icon"),
                ]),
            ]),
        ]);
    }
}

module.exports = task;