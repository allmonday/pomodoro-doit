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
var restComponent = require("./components/rest");
var weekComponent = require("./components/week");
// utils
var util = require("./utils/util");
var moment = require("moment");

// init
util.requireNotificationPermission();
window.addEventListener('blur', function() { console.log('blur'); window.blurred = true; });
window.addEventListener('focus',  function() { console.log('focus'); window.blurred = false; });

// reload page if tomorrow come.
setTimeout(function () {
    window.location.reload();
}, util.calTomorrowTimeout());

widget.controller = function update() {

    let vm = this;

    var init = function() {  // initialization function
        util.log("init widget");
        document.title = util.title;
        this.task = todo.task();
        this.today = todo.today();
        this.clock = todo.runningTask();
    }
    widget.service.init = init.bind(vm);

    util.socket.on("refresh-broadcast", function () {
        console.log('refresh');
        vm.init(); 
    })
    util.socket.emit("join", $("#user-name").text());

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

    widget.service.addPomo = vm.addPomo = function(id) {
        todo.addPomo(id).then(this.init);
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

    vm.cancelTask = widget.service.cancelTask = function cancelTask(taskId) {
        let that = this;
        $("#confirm-modal.ui.basic.modal")
            .modal({ 
                closable: false,
                onDeny: function () {
                },
                onApprove: function () {
                    todo.cancelTask(taskId).then(that.init);
                }
            })
            .modal("show");
    }.bind(vm);

    vm.updatePomodoro = (taskId, pomodoroId, validTime, interuptCount) => {
        todo.updatePomodoro(taskId, pomodoroId, validTime, interuptCount).then(update.bind(vm));
    }

    // start timer
    vm.startTimer = widget.service.startTimer = function startTimer(obj) {
        todo.startClock(obj.taskId._id(), obj.pomodoroId._id())
            .then(this.init); // .then(m.endComputation); 
    }.bind(vm);

    // reset timer (cancel it)
    widget.service.resetPomodoro = vm.resetPomodoro = function (taskId, pomodoroId) {
        var that = this;
        $("#confirm-modal.ui.basic.modal")
            .modal({ 
                closable: false,
                onDeny: function () {
                },
                onApprove: function () {
                    todo.resetPomodoro(taskId, pomodoroId)
                        .then(that.init); //.then(m.endComputation);
                }  // ...well..
            })
            .modal("show");
    }.bind(vm);

    // prepare for note edit modal
    vm.setNote = widget.service.setNote = function setNote(item) {  // refactor?
        this.clock.task().note = item.note();
        this.clock.task()._id = item._id();
        this.clock.task().name = item.name();
        setTimeout(function () {
            $(".pomodoro-note-main.ui.modal").modal("show");
            // $("#pomodoro-note-main_edit").focus();
        }, 100);
    }.bind(vm);

    // update notes
    vm.updateNote = widget.service.updateNote = function updateNot(taskId, note) {
        todo.updateNote(taskId, note)
            .then(this.init).then(this.showNote(true))
            .then(() => {
                $(".pomodoro-note-main.ui.modal").modal("hide");
            });
    }.bind(vm);

    vm.updatePinTask = widget.service.updatePinTask = function updatePinTask(taskId, pinVal) {
        todo.updatePinTask(taskId, pinVal)
            .then(this.init);
    }.bind(vm);

    // update name
    vm.updateName = widget.service.updateName = function updateNot(taskId, name) {
        todo.updateName(taskId, name)
            .then(this.init);
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
        let prev = util.isTop(e);
        e.target.classList.remove("over");
        e.stopPropagation();  // ul also has it
        e.preventDefault();

        let interTest = /^inter\-([0-9a-fA-F]){24}$/;
        let sourceid = e.dataTransfer.getData("Text");
        let isInter = false;

        if (interTest.test(sourceid)) {
            sourceid = sourceid.replace("inter-", "");	
            isInter = true
        }

        // source id already in target group? ignore it (it should not happen)
        let duplicateCheck = _.findIndex(vm.today(), item => {
            return item._id() === sourceid;
        });
        if (!isInter && duplicateCheck !== -1) {
            util.log("how you get there?");
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
            if (vm.today().length > 0) {
                targetid = _.last(vm.today())._id();
            } else {
                targetid = null
            }
        }
        todo.move(sourceid, targetid, isInter).then(this.init);
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
                                key: `${task._id()}${task.fixedTop()}`
                            })
                    })
                ]),
            ]),

            /* pomodoro today */
            m("#pomodoro-today.ui.segment.orange", [
                m(".pomodoro-today-list_display_estimated_total.ui.mini.message.orange", { style: 'flex-shrink: 0;' },[
                    vm.offset() === 0 ?
                        m("span", `${ util.minToHour(25 *(vm.clock.totalPomodoroToday() - vm.clock.completedPomodoroToday()))} ESTIMATED, PROGRESS: ${vm.clock.completedPomodoroToday()}/${vm.clock.totalPomodoroToday()}.`):
                        m("span", moment().subtract(vm.offset(), 'day').format("YYYY-MM-DD")),

                    m(".progress", { 
                        style : `width: ${Math.floor(100 * vm.clock.completedPomodoroToday()/vm.clock.totalPomodoroToday())}%;`
                    })
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
                            // class: `${vm.showNote()? '' : ''}`,
                            onclick: () => {
                                vm.showNote(!vm.showNote());
                            }
                        },[
                            m("i.icon", {
                                class: `${vm.showNote()? 'compress' : 'expand'}`,
                            })
                        ]),
                    ])
                ]),

                m(".pomodoro-util_cover"),

                /* today list */
                m("#pomodoro-today-list.ui.list.empty", {  
                    ondrop: vm.onchange.bind(null, null),
                    config: function (element, isInitialized) { if (!isInitialized) { util.dragdrop(element) } },
                    class: vm.showNote()? '': 'fold'

                }, [
                    vm.today().map(function(today) {
                        return m(todayComponent, {
                            key: `${JSON.stringify(today)}`,
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

                m(weekComponent, {key: 1})
            ]),

            /* modals */
            m(note, {
                key: `${vm.clock.task()._id}`,
                task: vm.clock.task,
            }),
            m(confirm),
            m(summary, { key: JSON.stringify(vm.today), today: vm.today }),
            m(restComponent),
        ])
    };

module.exports = widget;