var m = require("mithril");
var _ = require("lodash");

require("./mithril-dnd.scss");

var clockObserver = require("./dnd/utils/clockObserver");
var timerObservable = require("./dnd/utils/timerObservable");
var todo = require("./dnd/model/todo");
var pomodoro = require("./dnd/model/pomodoro");
var addItem = require("./dnd/components/add");
var pomoItem = require("./dnd/components/pomodoro");
var clock = require("./dnd/components/clock");

function isTop(e) {
	let top = e.target.offsetTop,
		bottom = top + e.target.clientHeight,
		posY = e.y,
		average = (top+bottom) /2;
	
	let result = posY <= average;
	return result;
}

function dragdrop(element, options) {
    options = options || {}

    element.addEventListener("dragover", activate)
    element.addEventListener("dragleave", deactivate)
    element.addEventListener("dragend", deactivate)

    function activate(e) {
		if (e.target.localName === 'li') {
			let top = isTop(e);
			e.target.classList.remove('top');
			e.target.classList.remove('bottom');
			e.target.classList.add(top? 'top': 'bottom');
			e.target.classList.add('selected');
		}
        e.preventDefault()
    }
    function deactivate(e) { 
		e.target.classList.remove('selected'); 
	}
}

var widget = {
	controller: function update() {
		
		let vm = this;
		vm.task = todo.task();
		vm.today = todo.today();
		vm.dragstart = (item, e) => {
			let dt = e.dataTransfer;
			dt.setData("Text", item._id());
		}
		vm.interdragstart = (item, e) => {
			let dt = e.dataTransfer;
			dt.setData("Text", `inter-${item._id()}`);
		}
		vm.addPomo = (item) => {
			if (item.pomodoros().length >= 5) {
				return false;
			}
			todo.addPomo(item._id()).then(update.bind(this));
		}
		vm.subPomo = (id) => {
			todo.subPomo(id).then(update.bind(this));
		}
		vm.addTask = (name) => {
			todo.addTask(name).then(update.bind(this));
		}
		vm.cancelTask = (name) => {
			todo.cancelTask(name).then(update.bind(this));
		}

		// set observables
		clockObserver.subscribe((obj) => {
			todo.startClock(obj.taskId, obj.pomodoroId).then(update.bind(this));
		})
		timerObservable.subscribe(() => {
		}, () => {}, () => {
			vm.task = todo.task();
		});


		vm.onchange = (item, e) => {
			let prev = isTop(e);
			e.target.classList.remove("selected");
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
			todo.move(sourceid, targetid, isInter).then(update.bind(this));
		}
	},
	view : function (ctrl) {
		return [
			m(".container", [
				m("ul.task", [
					m("li", [
						m(addItem, {addHandler: ctrl.addTask}),
					]),
					ctrl.task().map(function (item) {
						return m("li", {
							draggable: true,
							ondragstart: ctrl.dragstart.bind(ctrl, item)
						}, `${item.name()}-${item._id()}`);
					})
				]),
				m("ul.today", {
					ondrop: ctrl.onchange.bind(null, null),
					config: function (element, isInitialized) {
						if (!isInitialized) { dragdrop(element) }
					}
				}, [
					ctrl.today().map(function(item) {
						return m("li", {
							draggable: true,
							ondrop: ctrl.onchange.bind(null, item),
							ondragstart: ctrl.interdragstart.bind(ctrl, item),
							config: function (element, isInitialized) {
								if (!isInitialized) { dragdrop(element); }
							}
						}, [
							m("div", [
								m("p", `${item.name()}-${item._id()}`),
								m("button", {
									onclick: ctrl.addPomo.bind(null, item)
								}, 'add'),
								m("button", {
									onclick: ctrl.subPomo.bind(null, item._id())
								}, 'sub'),
								m("button", {
									onclick: ctrl.cancelTask.bind(null, item._id())
								}, 'cancel')
							]),
							m(pomoItem, {
								item: item,
								key: JSON.stringify(item)
							})
						])
					})
				]),
				m(clock)
			])
		]
	}
};

m.mount(document.body, widget);