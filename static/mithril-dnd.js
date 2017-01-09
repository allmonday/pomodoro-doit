var m = require("mithril");
var _ = require("lodash");
var moment = require("moment");
var markdown = require( "markdown" ).markdown;

require("./mithril-dnd.scss");

var clockObserver = require("./dnd/utils/clockObserver");
var timerObservable = require("./dnd/utils/timerObservable");
var todo = require("./dnd/model/todo");
var addItem = require("./dnd/components/add");
var pomodoro = require("./dnd/components/pomodoro");
var clock = require("./dnd/components/clock");
var confirm = require("./dnd/components/confirm");
var util = require("./dnd/utils/util");

function isTop(e) {
	let top = e.target.offsetTop,
		bottom = top + e.target.clientHeight,
		posY = e.y,
		average = (top + bottom) /2;
	
	let result = posY <= average;
	return result;
}

function dragdrop(element, options) {
    options = options || {}

    element.addEventListener("dragover", activate)
    element.addEventListener("dragleave", deactivate)
    element.addEventListener("dragend", deactivate)

    function activate(e) {
		e.target.classList.add("over");
		let top = isTop(e);
		e.target.classList.remove('drag-top', 'drag-bottom');
		e.target.classList.add(top? 'drag-top': 'drag-bottom');
        e.preventDefault()
    }
    function deactivate(e) { 
		e.target.classList.remove("over");
	}
}

var widget = {
	controller: function update() {
		
		let vm = this;
		vm.init = () => {
			vm.task = todo.task() || [];
			vm.today = todo.today() || [];
			vm.clock = todo.runningTask();
		}
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
		vm.interdragstart = (item, e) => {
			let dt = e.dataTransfer;
			dt.setData("Text", `inter-${item._id()}`);
		}
		vm.addPomo = (item) => {
			if (item.pomodoros().length >= 5) {
				return false;
			} else {
				todo.addPomo(item._id()).then(update.bind(vm));
			}
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

		vm.resetPomodoro = (taskId, pomodoroId) => {
			$(".ui.basic.modal")
				.modal({ 
					closable: false,
					onDeny: function () {
					},
					onApprove: function () {
						todo.resetPomodoro(taskId, pomodoroId).then(update.bind(vm));
					}
				})
				.modal("show");
		}

		vm.cancelTask = (name) => {
			todo.cancelTask(name).then(update.bind(vm));
		}
		vm.updateNote = (taskId, note) => {
			todo.updateNote(taskId, note).then(update.bind(vm));
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
			// vm.today = todo.today();
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

		vm.startHandler = function (obj) {
			todo.startClock(obj.taskId._id(), obj.pomodoroId._id()).then(vm.init); 
		}

		timerObservable.subscribe(() => { }, () => {}, () => { 
			// redraw
			vm.init();
			m.redraw();
			// update.bind(vm)();
		});

		vm.addTodayTask = function (name) {
			if (_.isEmpty(vm.today())) {
				todo.addTodayTask(name, null).then(update.bind(vm));
			} else {
				let prevNode = _.last(vm.today())._id();
				todo.addTodayTask(name, prevNode).then(update.bind(vm));
			}
		};

		vm.onchange = function moveTask(item, e) {
			let prev = isTop(e);
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
		}
	},
	view : function (ctrl) {
		return [
			m("#pomodoro-container.ui.container.fluid.raised.horizontal.segments", [
				m("#pomodoro-task.ui.teal.segment", [
					m(addItem, {addHandler: ctrl.addTask, addTodayHandler: ctrl.addTodayTask }),
					m(".pomodoro-util_cover"),
					m("#pomodoro-task_items.ui.list", [
						(ctrl.task() || []).filter((item) => { return !item.finished();}).map(function (item) {
							return m(".pomodoro-task_item.ui.segment", {
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
						m("span", `${ (ctrl.clock.totalPomodoroToday() - ctrl.clock.completedPomodoroToday())} pomodoros left, need ${ util.minToHour(25 *(ctrl.clock.totalPomodoroToday() - ctrl.clock.completedPomodoroToday()))}.`)
					]),
					m("#pomodoro-today-operate", [
						m("label.ui.button.mini.disabled", `${ctrl.offset} days ago`),
						m("button.ui.button.mini", { onclick: ctrl.prevDate }, "<"),
						m("button.ui.button.mini.orange", { onclick: ctrl.backToday }, "Today"),
						m("button.ui.button.mini", { onclick: ctrl.nextDate }, ">"),
					]),
					m(".pomodoro-util_cover"),
					m("#pomodoro-today-list.ui.list", {
						ondrop: ctrl.onchange.bind(null, null),
						config: function (element, isInitialized) {
							if (!isInitialized) { dragdrop(element) }
						},
						class: (ctrl.today() || []).length > 0? "not-empty": "empty" 
					}, [
						(ctrl.today() || []).map(function(item) {
							return m(".pomodoro-today-list_item.ui.segment", {
								class: !(todo.runningTask().hasRunning() || ctrl.offset !== 0)? 'orange': '', 
								draggable: (todo.runningTask().hasRunning())? false : true,  // freeze if task is running
								ondrop: ctrl.onchange.bind(null, item),
								ondragstart: ctrl.interdragstart.bind(ctrl, item),
								config: function (element, isInitialized) {
									if (!isInitialized) { dragdrop(element); }
								}
							}, [
								m(".pomodoro-today-list_display_estimated.ui.top.left.attached.orange.label", [
									m("i.icon.hourglass.end"),
									m("span", `${25 * item.pomodoros().length} minutes`)
								]),
								m(".pomodoro-today-list_display", [
									m("p.pomodoro-today-list_display_name", `${item.name()}`),
									item.note() ?  m(".ui.pomodoro-today-list_display_note", [
										m("div", m.trust(markdown.toHTML(item.note())))
									]) : m("div"),
								]),
								m(".pomodoro-today-list_operate.ui.labels.circular", [
									m(".label.ui.orange", {
										disabled: item.pomodoros().length >= 5,
										onclick: ctrl.addPomo.bind(null, item)
										}, [
										m("i.add.icon"),
									]),

									m(".label.ui", {
										disabled: item.pomodoros().length <= 1,
										onclick: ctrl.subPomo.bind(null, item._id())
									}, [
										m("i.minus.icon"),
									]),
									m(".label.ui", {
										disabled: todo.runningTask().hasRunning(),
										onclick: ctrl.cancelTask.bind(null, item._id())
									}, [
										m("i.remove.icon"),
									])
								]),
								m(pomodoro, {
									startHandler: ctrl.startHandler,
									resetPomodoro: ctrl.resetPomodoro,
									item: item,
									key: JSON.stringify(item)
								})
							])
						})
					]),
					m(".pomodoro-util_cover.above"),
					m(".pomodoro-today-list_summary.ui.button.orange", 
					{ style: 'flex-shrink: 0;'},
					[
						m("i.icon.book"),
						m("span", "summary")
					])
				]),
				m("#pomodoro-clock.ui.segment", [
					m(clock, {
						key: JSON.stringify(ctrl.clock.pomodoro),
						task: ctrl.clock.task,
						pomodoro: ctrl.clock.pomodoro,
						updateNote: ctrl.updateNote,  //cb 
						updatePomodoro: ctrl.updatePomodoro  //cb
					})
				]),

				m(confirm)  // confirm modal
			])
		]
	}
};

m.mount(document.querySelector("#pomodoro-app"), widget);