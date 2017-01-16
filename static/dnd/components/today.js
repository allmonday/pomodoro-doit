var m = require("mithril");
var widget = require("../app");
var markdown = require("markdown").markdown;
var todo = require("../model/todo");
var pomodoro = require("./pomodoro");
var util = require("../utils/util");

var today = {
    controller: function (data) {
        let vm = this;
        vm.offset = data.offset;
        vm.today = data.today
        vm.showNote = data.showNote;
    },
    view: function (vm) {
        return m(".pomodoro-today-list_item.ui.segment", {
            // onclick: vm.setNote.bind(null, item),
            class: `${!(todo.runningTask().hasRunning() || vm.offset() !== 0)? 'orange': ''} ${vm.today.isRunning()? 'running': ''}`, 
            onclick: () => widget.service.setNote(vm.today),
            draggable: (todo.runningTask().hasRunning())? false : true,  // freeze if task is running
            ondrop: (e) => widget.service.onchange(vm.today, e),
            ondragstart: (e) => widget.service.interdragstart(vm.today, e),
            config: function (element, isInitialized) {
                if (!isInitialized) { util.dragdrop(element); }
            }
        }, [
            m(".pomodoro-today-list_display_estimated.ui.top.left.attached.orange.label", [
                m("i.icon.hourglass.end"),
                m("span", `${25 * vm.today.pomodoros().length} minutes`)
            ]),
            m(".pomodoro-today-list_display", [
                m("p.pomodoro-today-list_display_name", `${vm.today.name()}`),
                vm.today.note() && vm.showNote() ?  m(".ui.pomodoro-today-list_display_note", [
                    m("div", m.trust(markdown.toHTML(vm.today.note())))
                ]) : m("div"),
            ]),

            // if today && not finished  && not running  => show remove button
            vm.today.isToday() && !vm.today.finished() && !vm.today.isRunning() ?
            m(".pomodoro-today-list_operate.ui.labels.circular", [
                m(".label.ui.pomodoro-today-list_operate_close", {
                    onclick: () => widget.service.cancelTask(vm.today._id())
                }, [
                    m("i.remove.icon"),
                ])
            ]): m("div"),

            vm.today.isToday()?
            m(".pomodoro-today-list_timer-edit.ui.labels.circular", [
                m(".label.ui", {
                    class: vm.today.pomodoros().length >= 5 ? "disabled" :"",
                    onclick: vm.today.pomodoros().length >= 5 ? () => {}: () => {widget.service.addPomo(vm.today);}
                    }, [
                    m("i.add.icon"),
                ]),

                m(".label.ui", {
                    class: vm.today.pomodoros().length <= 1 ? "disabled" :"",
                    onclick: vm.today.pomodoros().length <= 1 ? ()=> {}: () => {widget.service.subPomo(vm.today._id()); }
                }, [
                    m("i.minus.icon"),
                ])
            ]): m("div"),

            m(pomodoro, {
                today: vm.today,
                key: JSON.stringify(vm.today)
            })
        ])

    }
}

module.exports = today;