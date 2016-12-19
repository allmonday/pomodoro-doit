var m = require("mithril");
var _ = require("lodash");
require("./mithril-dnd.scss");

var addItem = require("./dnd/add");
var pomoItem = require("./dnd/pomo");

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

var todo = function(data) {
	data = data || {};
	this.id = m.prop(data.id ||"");
	this.name = m.prop(data.name || "");
	this.pomo = m.prop(data.pomo || []);
};

todo.task = function(data) {
	return m.request({ method: "GET", url: "/api/dnd/task", type: todo})
}
todo.today = function (data) {
	return m.request({ method: "GET", url: "/api/dnd/today", type: todo})
}

todo.move = (sourceid, targetid, isInter, top) => {
	console.log(sourceid, targetid, isInter, top);
	return m.request({ method: "post", url: "/api/dnd/today", data: {
		sourceid: sourceid,
		targetid: targetid,
		isinter: isInter,
		top: top
	}})
}

todo.cancelTask = (id) => {
	return m.request({method: "post", url: "/api/dnd/task/cancel", data: {id: id}});
}
todo.addPomo = (id) => {
	return m.request({method: "post", url: "/api/dnd/today/add", data: {id: id}});
}
todo.subPomo = (id) => {
	return m.request({method: "post", url: "/api/dnd/today/sub", data: {id: id}});
}
todo.addTask = (name) => {
	return m.request({ method: "post", url: "/api/dnd/addtask", data: {name: name}});
}

var widget = {
	controller: function update() {
		
		let vm = this;
		vm.task = todo.task();
		vm.today = todo.today();
		vm.dragstart = (item, e) => {
			let dt = e.dataTransfer;
			dt.setData("Text", item.id());
		}

		vm.interdragstart = (item, e) => {
			let dt = e.dataTransfer;
			dt.setData("Text", `inter-${item.id()}`);
		}
		vm.addPomo = (id) => {
			todo.addPomo(id).then(update.bind(this));
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

		vm.onchange = (item, e) => {
			let top = isTop(e);
			e.target.classList.remove("selected");
			e.stopPropagation();  // ul also has it

			let interTest = /^inter\-\d$/;
			let sourceid = e.dataTransfer.getData("Text");
			let isInter = false;

			if (interTest.test(sourceid)) {
				sourceid = sourceid.replace("inter-", "");	
				isInter = true
			}
			sourceid = +sourceid;

			// source id already in target group? ignore it
			let duplicateCheck = _.findIndex(vm.today(), item => {
				return item.id() === sourceid;
			});
			if (!isInter && duplicateCheck !== -1) {
				return;
			}

			let targetid;
			if (item) {
				targetid = item.id();
			} else {
				targetid = null
			}
			todo.move(sourceid, targetid, isInter, top).then(update.bind(this));
		}
	},
	view : function (ctrl) {
		return [
			m(".container", [
				m("ul.task", [
					ctrl.task().map(function (item) {
						return m("li", {
							draggable: true,
							ondragstart: ctrl.dragstart.bind(ctrl, item)
						}, `${item.name()}-${item.id()}`);
					}),
					m(addItem, {addHandler: ctrl.addTask})
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
								m("span", `${item.name()}-${item.id()}`),
								m("button", {
									onclick: ctrl.addPomo.bind(null, item.id())
								}, 'add'),
								m("button", {
									onclick: ctrl.subPomo.bind(null, item.id())
								}, 'sub'),
								m("button", {
									onclick: ctrl.cancelTask.bind(null, item.id())
								}, 'cancel')
							]),
							m(pomoItem, {pomo: item.pomo(), key: `${item.id()}-${item.pomo().length}`})
						])
					})
				]),
			])
		]
	}
};

m.mount(document.body, widget);