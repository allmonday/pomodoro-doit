var m = require("mithril");
require("./widget.scss");
// model
var todo = require("./model/todo");
// components
var widget = require("./app");
var addItem = require("./components/add");
var pomodoro = require("./components/pomodoro");
var clock = require("./components/clock");
var confirm = require("./components/confirm");
var note = require("./components/note");
var summary = require("./components/summary");
var taskComponent = require("./components/task");
var todayComponent = require("./components/today");
// utils
var util = require("./utils/util");
var moment = require("moment");

// init
util.requireNotificationPermission();

// reload page if tomorrow come.
setTimeout(function () {
    window.location.reload();
}, util.calTomorrowTimeout());

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

    // flags
    vm.showNote = m.prop(false);
    vm.offset = m.prop(0);   // date offset, yesterday == -1

    vm.prevDate = function () {
        vm.offset(vm.offset() + 1) ;
        vm.today = todo.today(moment().subtract(vm.offset(), 'days').format("YYYY-MM-DD"));
    };

    vm.backToday = function () {
        if (vm.offset() === 0) {
            return;
        }
        vm.offset(0);
        vm.init();
    };

    vm.nextDate = function () {
        if (vm.offset() > 1) {
            vm.offset(vm.offset() - 1);
            vm.today = todo.today(moment().subtract(vm.offset(), 'days').format("YYYY-MM-DD"));
        } else if (vm.offset() === 1) {
            vm.offset(vm.offset() - 1);
            vm.init();
        }
    };


    vm.dragstart = widget.service.dragstart = function dragstart(item, e) {
        let info;
        if (item.assigned()) {
            info = `inter-${item._id()}`;
        } else {
            info = item._id();
        }
        let dt = e.dataTransfer;
        dt.setData("Text", info);
    }

    vm.interdragstart = widget.service.interdragstart = function interdragstart(item, e) {
        let dt = e.dataTransfer;
        dt.setData("Text", `inter-${item._id()}`);
    }

    widget.service.addPomo = vm.addPomo = function(item) {
        todo.addPomo(item._id()).then(this.init);
    }.bind(vm);

    widget.service.subPomo = vm.subPomo = function(id) {
        todo.subPomo(id).then(this.init);
    }.bind(vm);

    vm.addTask = (name) => {
        todo.addTask(name).then(update.bind(vm));
    }

    vm.removeTask = widget.service.removeTask = function removeTask(taskId) {
        let that = this;
        $("#confirm-modal.ui.basic.modal")
            .modal({ 
                closable: false,
                onDeny: function () {
                },
                onApprove: function () {
                    todo.removeTask(taskId).then(that.init);
                }
            })
            .modal("show");
    }.bind(vm);

    var cancelTask = function(name) {
        todo.cancelTask(name).then(this.init);
    }
    vm.cancelTask = widget.service.cancelTask = cancelTask.bind(vm);

    vm.updatePomodoro = (taskId, pomodoroId, validTime, interuptCount) => {
        todo.updatePomodoro(taskId, pomodoroId, validTime, interuptCount).then(update.bind(vm));
    }

    // start timer
    vm.startTimer = widget.service.startTimer = function startTimer(obj) {
        todo.startClock(obj.taskId._id(), obj.pomodoroId._id())
            .then(this.init); 
    }.bind(vm);

    // reset timer (cancel it)
    vm.resetPomodoro = widget.service.resetPomodoro = function (taskId, pomodoroId) {
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
    }.bind(vm);


    // update notes
    vm.updateNote = widget.service.updateNote = function updateNot(taskId, note) {
        todo.updateNote(taskId, note)
            .then(this.init).then(this.showNote(true));
    }.bind(vm);
    
    // summary
    widget.service.summary = () => {
        $("#summary-modal.ui.modal")
            .modal('setting', 'transition', 'scale')
            .modal("show");
    }

    vm.addTodayTask = function (name) {
        if (_.isEmpty(vm.today())) {
            todo.addTodayTask(name, null).then(update.bind(vm));
        } else {
            let prevNode = _.last(vm.today())._id();
            todo.addTodayTask(name, prevNode).then(update.bind(vm));
        }
    };

    vm.onchange = widget.service.onchange = function moveTask(item, e) {
        console.log(item);
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
        todo.move(sourceid, targetid, isInter).then(this.init);
    }.bind(vm);

    vm.setNote = widget.service.setNote = function setNote(item) {  // refactor?
        this.clock.task().note = item.note();
        this.clock.task()._id = item._id();
        this.clock.task().name = item.name();
        setTimeout(function () {
            $("#pomodoro-note-main_edit").focus();
        }, 100);
    }.bind(vm);
};

widget.view = function (vm) {
    return m("#pomodoro-container.ui.container.fluid.raised.horizontal.segments", [

            /* pomodoro task */
            m("#pomodoro-task.ui.teal.segment", [
                m(addItem, {addHandler: vm.addTask, addTodayHandler: vm.addTodayTask }),
                m(".pomodoro-util_cover"),
                m("#pomodoro-task_items.ui.list", [
                    vm.task()
                        .filter((task) => { return !task.finished();})
                        .map(function (task) {
                            return m(taskComponent, {
                                task: task, 
                                offset: vm.offset,
                                key: `${task._id()}${vm.offset()}`
                            })
                    })
                ]),
            ]),

            /* pomodoro today */
            m("#pomodoro-today.ui.segment.orange", [
                m(".pomodoro-today-list_display_estimated_total.ui.mini.message.orange", { style: 'flex-shrink: 0;' },[
                    m("span", `${ util.minToHour(25 *(vm.clock.totalPomodoroToday() - vm.clock.completedPomodoroToday()))} estimated, progress: ${vm.clock.completedPomodoroToday()}/${vm.clock.totalPomodoroToday()}.`),
                ]),

                m("#pomodoro-today-operate", [
                    m("label.ui.button.mini.disabled", `${vm.offset()} days ago`),
                    m("#pomodoro-today-operate_group", [
                        m("button.ui.button.mini", { onclick: vm.prevDate }, "<"),
                        m("button.ui.button.mini.orange", { onclick: vm.backToday }, "Today"),
                        m("button.ui.button.mini", { 
                            onclick: vm.nextDate,
                            disabled: vm.offset() === 0

                        }, ">"),
                        m("button.ui.tiny.icon.button", {
                            class: `${vm.showNote()? '' : 'orange'}`,
                            onclick: () => {
                                vm.showNote(!vm.showNote());
                            }
                        },[
                            m("i.icon", {
                                class: `${vm.showNote()? 'list' : 'edit'}`,
                            })
                        ]),
                    ])
                ]),

                m(".pomodoro-util_cover"),

                /* today list */
                m("#pomodoro-today-list.ui.list", {  
                    ondrop: vm.onchange.bind(null, null),
                    config: function (element, isInitialized) { if (!isInitialized) { util.dragdrop(element) } },
                    class: vm.today().length > 0? "not-empty": "empty"   // to display background for empty
                }, [
                    vm.today().map(function(today) {
                        return m(todayComponent, {
                            // key: `${[today._id(), vm.offset(), vm.showNote()].join('')}`,
                            key: JSON.stringify(today),
                            today: today,
                            showNote: vm.showNote,
                            offset: vm.offset,
                        });
                    })
                ]),

                m(".pomodoro-util_cover.above"),

                /* today summary */
                m(".pomodoro-today-list_summary.ui.button.orange", {
                    style: 'flex-shrink: 0;', 
                    onclick: widget.service.summary 
                }, [
                    m("i.icon.book"),
                    m("span", "summary")
                ])
            ]),

            /* clock */
            m("#pomodoro-clock.ui.segment", [
                m(clock, {
                    key: JSON.stringify(vm.clock.pomodoro),
                    task: vm.clock.task,
                    pomodoro: vm.clock.pomodoro,
                    updatePomodoro: vm.updatePomodoro  //cb
                }),
                vm.clock.task()._id ?
                m("#pomodoro-note", [
                    m(note, {
                        key: `${vm.clock.task()._id}`,
                        task: vm.clock.task,
                    })
                ]) : m("div",""),

            ]),

            /* modals */
            m(confirm),
            m(summary, { today: vm.today }),
        ])
    };

module.exports = widget;