var m = require("mithril");
require("./mithril-dnd.scss");

var todo = {
	left: m.prop([]),
	right: m.prop([])
};
todo.left([1,2,3,4]);
todo.right([11,22,33]);

todo.controller = function () {
	let vm = this;

};
todo.view = function (ctrl) {
	return [
		m(".container", [
			m("ul.left", [
				todo.left().map(item => {
					return m("li", {draggable: true}, item);
				})
			]),
			m("ul.right", [
				todo.right().map(item => {
					return m("li", item)
				})
			])

		])
	]
};

m.mount(document.body, { view: todo.view});