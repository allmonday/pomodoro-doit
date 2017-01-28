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
        vm.save = (e) => {
            $(e.target).blur();
            vm.loading(true);
            setTimeout(() => {
                widget.service.updateName(vm.today._id(), vm.today.name())
                vm.loading(false);
            }, 400);
        }
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
                m(".pomodoro-today-list_display_estimated.ui.top.left.attached.orange.label", {
                    class: `${vm.today.finished() ? 'finished':''}`
                }, [
                    m("i.icon.hourglass.end"),
                    m("span", `${widget.service.user().range() * vm.today.pomodoros().length} minutes`)
                ]):
                m("div"),

            m(".pomodoro-today-list_display", [

                /* editable content */
                m(".pomodoro-today-list-content", {
                    draggable: false,
                    style: 'margin-right: 130px;'
                }, [
                    m("input.pomodoro-task_item-content-edit", {
                        oninput: m.withAttr('value', vm.today.name), 
                        value: vm.today.name(),
                        onkeypress: (e) => {
                            if (e.keyCode === 13) {
                                vm.save(e);
                            }
                        }
                    })
                ]),
                vm.today.note() && vm.showNote() ?  m(".ui.pomodoro-today-list_display_note", [
                    m("div", m.trust(markdown.toHTML(vm.today.note())))
                ]) : m("div"),
                // m("p.pomodoro-today-list_display_name", `${vm.today.name()}`),
                m(".pomodoro-task_item_tags", [
                    vm.today.tags().map(item => {
                        return m("span.pomodoro-task_item_tag", {
                            style: `background: ${util.hashStringToColor(item)}`
                        }, item);
                    })
                ]),
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
                        }, 100);
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
                        }, 100);
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