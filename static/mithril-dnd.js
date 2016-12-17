var m = require("mithril");
var _ = require("lodash");
require("./mithril-dnd.scss");

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
};

todo.left = function(data) {
	return m.request({ method: "GET", url: "/api/dnd/left", type: todo})
}
todo.right = function (data) {
	return m.request({ method: "GET", url: "/api/dnd/right", type: todo})
}
todo.move = (sourceid, targetid, isInter, top) => {
	return m.request({ method: "post", url: "/api/dnd/right", data: {
		sourceid: sourceid,
		targetid: targetid,
		isinter: isInter,
		top: top
	}})
}

var widget = {
	controller: function update() {
		
		let vm = this;
		vm.left = todo.left();
		vm.right = todo.right();
		vm.dragstart = (item, e) => {
			let dt = e.dataTransfer;
			dt.setData("Text", item.id());
		}

		vm.interdragstart = (item, e) => {
			let dt = e.dataTransfer;
			dt.setData("Text", `inter-${item.id()}`);
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
			let duplicateCheck = _.findIndex(vm.right(), item => {
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
				m("ul.left", [
					ctrl.left().map(function (item) {
						return m("li", {
							draggable: true,
							ondragstart: ctrl.dragstart.bind(ctrl, item)
						}, `${item.name()}-${item.id()}`);
					})
				]),
				m("ul.right", {
					ondrop: ctrl.onchange.bind(null, null),
					config: function (element, isInitialized) {
						if (!isInitialized) { dragdrop(element) }
					}
				}, [
					ctrl.right().map(function(item) {
						return m("li", {
							draggable: true,
							ondrop: ctrl.onchange.bind(null, item),
							ondragstart: ctrl.interdragstart.bind(ctrl, item),
							config: function (element, isInitialized) {
								if (!isInitialized) { dragdrop(element); }
							}
						}, `${item.name()}-${item.id()}`)
					})
				]),
			])
		]
	}
};

m.mount(document.body, widget);