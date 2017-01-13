var m = require("mithril");
// var _ = require("lodash");
var moment = require("moment");
var markdown = require("markdown").markdown;

require("./widget.scss");

var todo = require("./model/todo");

// components
var widget = require("./app");
var addItem = require("./components/add");
var pomodoro = require("./components/pomodoro");
var clock = require("./components/clock");
var confirm = require("./components/confirm");
var note = require("./components/note");
// utils
var util = require("./utils/util");
util.requireNotificationPermission();


widget.controller = function update() {
    let vm = this;

    var init = function() {  // initialization function
        this.task = todo.task();
        this.today = todo.today();
        this.clock = todo.runningTask();
    }
    widget.service.init = init.bind(vm);

    // initialization
    vm.init = init.bind(vm);
    vm.init();

    vm.dragstart = (item, e) => {
        let info;
        if (item.assigned()) {
            info = `inter-${item._id()}`;
        } else {
            info = item._id();
        }
        let dt = e.dataTransfer;
        dt.setData("Text", info);
    }
    vm.showNote = m.prop(false);

    vm.interdragstart = (item, e) => {
        let dt = e.dataTransfer;
        dt.setData("Text", `inter-${item._id()}`);
    }

    vm.addPomo = (item) => {
        todo.addPomo(item._id()).then(update.bind(vm));
    }
    vm.subPomo = (id) => {
        todo.subPomo(id).then(update.bind(vm));
    }
    vm.addTask = (name) => {
        todo.addTask(name).then(update.bind(vm));
    }
    vm.removeTask = (taskId) => {
        $(".ui.basic.modal")
            .modal({ 
                closable: false,
                onDeny: function () {
                },
                onApprove: function () {
                    todo.removeTask(taskId).then(update.bind(vm));
                }
            })
            .modal("show");
    }

    vm.cancelTask = (name) => {
        todo.cancelTask(name).then(update.bind(vm));
    }
    vm.updatePomodoro = (taskId, pomodoroId, validTime, interuptCount) => {
        todo.updatePomodoro(taskId, pomodoroId, validTime, interuptCount).then(update.bind(vm));
    }

    vm.offset = 0;

    vm.prevDate = function () {
        vm.offset += 1;
        vm.today = todo.today(moment().subtract(vm.offset, 'days').format("YYYY-MM-DD"));
    };

    vm.backToday = function () {
        if (vm.offset === 0) {
            return;
        }
        vm.offset = 0;
        vm.init();
    };

    vm.nextDate = function () {
        if (vm.offset > 1) {
            vm.offset -= 1;
            vm.today = todo.today(moment().subtract(vm.offset, 'days').format("YYYY-MM-DD"));
        } else if (vm.offset === 1) {
            vm.offset -= 1;
            vm.init();
        }
    };

    // start timer
    var startTimer = function (obj) {
        todo.startClock(obj.taskId._id(), obj.pomodoroId._id())
            .then(this.init); 
    }
    vm.startTimer = startTimer.bind(vm);
    widget.service.startTimer = startTimer.bind(vm);

    // reset timer (cancel it)
    var resetPomodoro = function (taskId, pomodoroId) {
        $(".ui.basic.modal")
            .modal({ 
                closable: false,
                onDeny: function () {
                },
                onApprove: function () {
                    todo.resetPomodoro(taskId, pomodoroId)
                        .then(this.init);
                }.bind(this)  // ...well..
            })
            .modal("show");
    }
    vm.resetPomodoro = resetPomodoro.bind(vm);
    widget.service.resetPomodoro = resetPomodoro.bind(vm);

    // update notes
    var updateNote = function(taskId, note) {
        todo.updateNote(taskId, note)
            .then(this.init).then(this.showNote(true));
    }
    vm.updateNote = updateNote.bind(vm);
    widget.service.updateNote = updateNote.bind(vm);
    
    // summary
    widget.service.summary = () => {
        console.log('summary');
        alert("You did a great JOB!");
    }

    vm.addTodayTask = function (name) {
        if (_.isEmpty(vm.today())) {
            todo.addTodayTask(name, null).then(update.bind(vm));
        } else {
            let prevNode = _.last(vm.today())._id();
            todo.addTodayTask(name, prevNode).then(update.bind(vm));
        }
    };

    vm.onchange = function moveTask(item, e) {
        let prev = util.isTop(e);
        e.target.classList.remove("over");
        e.stopPropagation();  // ul also has it

        let interTest = /^inter\-([0-9a-fA-F]){24}$/;
        let sourceid = e.dataTransfer.getData("Text");
        let isInter = false;

        if (interTest.test(sourceid)) {
            sourceid = sourceid.replace("inter-", "");	
            isInter = true
        }

        // source id already in target group? ignore it
        let duplicateCheck = _.findIndex(vm.today(), item => {
            return item._id() === sourceid;
        });
        if (!isInter && duplicateCheck !== -1) {
            return;
        }

        let targetid;
        if (item) {
            if (prev) {
                targetid = item.prevNode();
            } else {
                targetid = item._id();
            }
        } else {
            targetid = null
        }
        todo.move(sourceid, targetid, isInter).then(update.bind(vm));
    };

    vm.setNote = function setNote(item) {  // refactor?
        vm.clock.task().note = item.note();
        vm.clock.task()._id = item._id();
        vm.clock.task().name = item.name();
        setTimeout(function () {
            $("#pomodoro-note-main_edit").focus();
        }, 100);
    }
};

widget.view = function (ctrl) {
    return m("#pomodoro-container.ui.container.fluid.raised.horizontal.segments", [
            m("#pomodoro-task.ui.teal.segment", [
                m(addItem, {addHandler: ctrl.addTask, addTodayHandler: ctrl.addTodayTask }),
                m(".pomodoro-util_cover"),
                m("#pomodoro-task_items.ui.list", [
                    ctrl.task().filter((item) => { return !item.finished();}).map(function (item) {
                        return m(".pomodoro-task_item.ui.segment", {
                            key: item._id(),
                            class: `${!(todo.runningTask().hasRunning() || ctrl.offset !== 0)? 'teal': ''} ${ item.assigned()? 'assigned': ''}`,
                            draggable: (todo.runningTask().hasRunning() || ctrl.offset !== 0)? false: true,
                            ondragstart: ctrl.dragstart.bind(ctrl, item)
                        },[
                            m("p.pomodoro-task_item-content", `${item.assigned()? '( yesterday )': ''} ${item.name()}`),
                            m(".ui.labels.circular", [
                                m(".ui.label.pomodoro-task_item-content_delete", {
                                    onclick: ctrl.removeTask.bind(null, item._id())
                                }, [
                                    m("i.remove.icon"),
                                ]),
                            ]),
                        ]);
                    })
                ]),
            ]),

            m("#pomodoro-today.ui.segment.orange", [
                m(".pomodoro-today-list_display_estimated.ui.top.large.label", [
                    m("i.icon.wait"),
                    m("span", `Progress: ${ctrl.clock.completedPomodoroToday()}/${ctrl.clock.totalPomodoroToday()}, need ${ util.minToHour(25 *(ctrl.clock.totalPomodoroToday() - ctrl.clock.completedPomodoroToday()))}.`)
                ]),
                m("#pomodoro-today-operate", [
                    m("label.ui.button.mini.disabled", `${ctrl.offset} days ago`),
                    m("#pomodoro-today-operate_group", [
                        m("button.ui.tiny.icon.button", {
                            class: `${ctrl.showNote()? '' : 'orange'}`,
                            onclick: () => {
                                ctrl.showNote(!ctrl.showNote());
                            }
                        },[
                            m("i.icon", {
                                class: `${ctrl.showNote()? 'list' : 'edit'}`,
                            })
                        ]),
                        m("button.ui.button.mini", { onclick: ctrl.prevDate }, "<"),
                        m("button.ui.button.mini.orange", { onclick: ctrl.backToday }, "Today"),
                        m("button.ui.button.mini", { 
                            onclick: ctrl.nextDate,
                            disabled: ctrl.offset === 0

                        }, ">"),
                    ])
                ]),
                m(".pomodoro-util_cover"),
                m("#pomodoro-today-list.ui.list", {
                    ondrop: ctrl.onchange.bind(null, null),
                    config: function (element, isInitialized) {
                        if (!isInitialized) { util.dragdrop(element) }
                    },
                    class: ctrl.today().length > 0? "not-empty": "empty" 
                }, [
                    ctrl.today().map(function(item) {
                        return m(".pomodoro-today-list_item.ui.segment", {
                            onclick: ctrl.setNote.bind(null, item),
                            key: item._id(),
                            class: `${!(todo.runningTask().hasRunning() || ctrl.offset !== 0)? 'orange': ''} ${item.isRunning()? 'running': ''}`, 
                            draggable: (todo.runningTask().hasRunning())? false : true,  // freeze if task is running
                            ondrop: ctrl.onchange.bind(null, item),
                            ondragstart: ctrl.interdragstart.bind(ctrl, item),
                            config: function (element, isInitialized) {
                                if (!isInitialized) { util.dragdrop(element); }
                            }
                        }, [
                            m(".pomodoro-today-list_display_estimated.ui.top.left.attached.orange.label", [
                                m("i.icon.hourglass.end"),
                                m("span", `${25 * item.pomodoros().length} minutes`)
                            ]),
                            m(".pomodoro-today-list_display", [
                                m("p.pomodoro-today-list_display_name", `${item.name()}`),
                                item.note() && ctrl.showNote() ?  m(".ui.pomodoro-today-list_display_note", [
                                    m("div", m.trust(markdown.toHTML(item.note())))
                                ]) : m("div"),
                            ]),
                            m(".pomodoro-today-list_operate.ui.labels.circular", [
                                m(".label.ui", {
                                    // class : todo.runningTask().hasRunning() ? "hide": "",
                                    onclick: ctrl.cancelTask.bind(null, item._id())
                                }, [
                                    m("i.remove.icon"),
                                ])
                            ]),
                            m(".pomodoro-today-list_timer-edit.ui.labels.circular", [
                                m(".label.ui.orange", {
                                    class: item.pomodoros().length >= 5 ? "disabled" :"",
                                    onclick: item.pomodoros().length >= 5 ? () => {}: ctrl.addPomo.bind(null, item)
                                    }, [
                                    m("i.add.icon"),
                                ]),

                                m(".label.ui", {
                                    class: item.pomodoros().length <= 1 ? "disabled" :"",
                                    onclick: item.pomodoros().length <= 1 ? ()=> {}: ctrl.subPomo.bind(null, item._id())
                                }, [
                                    m("i.minus.icon"),
                                ])
                            ]),
                            m(pomodoro, {
                                resetPomodoro: ctrl.resetPomodoro,
                                item: item,
                                key: JSON.stringify(item)
                            })
                        ])
                    })
                ]),
                m(".pomodoro-util_cover.above"),
                // m(".pomodoro-today-list_summary.ui.button.orange", {
                //     style: 'flex-shrink: 0;', 
                //     onclick: widget.service.summary 
                // }, [
                //     m("i.icon.book"),
                //     m("span", "summary")
                // ])
            ]),
            m("#pomodoro-clock.ui.segment", [
                m(clock, {
                    key: JSON.stringify(ctrl.clock.pomodoro),
                    task: ctrl.clock.task,
                    pomodoro: ctrl.clock.pomodoro,
                    updatePomodoro: ctrl.updatePomodoro  //cb
                }),
                ctrl.clock.task()._id ?
                m("#pomodoro-note", [
                    m(note, {
                        key: `${ctrl.clock.task()._id}`,
                        task: ctrl.clock.task,
                    })
                ]) : m("div",""),

            ]),
            m(confirm)  // confirm modal
        ])
    };

module.exports = widget;