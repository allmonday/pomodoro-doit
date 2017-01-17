var m = require("mithril");
var todo = require("../model/todo");
var widget = require("../app");

var task = {
    controller: function (data) {
        let vm = this;
        vm.task = data.task;
        vm.offset = data.offset;
    },
    view: function (vm) {
        return m(".pomodoro-task_item.ui.segment", {
            class: `${vm.offset() ===0? 'teal': ''} ${ vm.task.assigned()? 'assigned': ''}`,
            draggable: vm.offset() === 0,
            ondragstart: widget.service.dragstart.bind(vm, vm.task)
        },[
            m("p.pomodoro-task_item-content", `${vm.task.assigned()? '( yesterday )': ''} ${vm.task.name()}`),
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