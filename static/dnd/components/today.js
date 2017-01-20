var m = require("mithril");
var widget = require("../app");
var markdown = require("markdown").markdown;
var todo = require("../model/todo");
var pomodoro = require("./pomodoro");
var util = require("../utils/util");

var today = {
    controller: function (data) {
        util.log('init today');
        let vm = this;
        vm.offset = data.offset;
        vm.today = data.today
        vm.showNote = data.showNote;
        vm.loading = m.prop(false);
    },
    view: function (vm) {
        return m(".pomodoro-today-list_item.ui.segment", {
            class: `${vm.today.isRunning()? 'orange': ''} ${vm.loading() ? 'loading' : ''}`, 
            draggable: vm.offset() === 0,  // freeze if task is running
            ondrop: (e) => widget.service.onchange(vm.today, e),
            ondragstart: (e) => widget.service.interdragstart(vm.today, e),
            config: function (element, isInitialized) {
                if (!isInitialized) { util.dragdrop(element); }
            }
        }, [
            vm.showNote()?
                m(".pomodoro-today-list_display_estimated.ui.top.left.attached.orange.label", [
                    m("i.icon.hourglass.end"),
                    m("span", `${25 * vm.today.pomodoros().length} minutes`)
                ]):
                m("div"),

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
                    onclick: () => { widget.service.setNote(vm.today); }
                }, [
                    m("i.edit.icon"),
                ]),

                m(".label.ui", {
                    class: vm.today.pomodoros().length <= 1 ? "disabled" :"",
                    onclick: vm.today.pomodoros().length <= 1 ? ()=> {}: () => {
                        vm.loading(true);
                        setTimeout(() => {
                            vm.loading(false);
                            widget.service.subPomo(vm.today._id()); 
                        }, 200);
                    }
                }, [
                    m("i.minus.icon"),
                ]),

                m(".label.ui", {
                    class: vm.today.pomodoros().length >= 5 ? "disabled" :"",
                    onclick: vm.today.pomodoros().length >= 5 ? () => {}: () => {
                        vm.loading(true);
                        setTimeout(() => {
                            vm.loading(false);
                            widget.service.addPomo(vm.today._id());
                        }, 200);
                    }
                    }, [
                    m("i.add.icon"),
                ]),
            ]): m("div"),

            m(pomodoro, {
                today: vm.today,
                key: JSON.stringify(vm.today)
            })
        ])

    }
}

module.exports = today;