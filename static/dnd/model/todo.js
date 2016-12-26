var m = require("mithril");
var pomodoro = require("./pomodoro");

var todo = {};

todo.TODO = function (data) {  // class
	data = data || {};
	this._id = m.prop(data._id ||"");
	this.name = m.prop(data.name || "");
	this.pomodoros = m.prop((data.pomodoros || []).map((item) => {
		return new pomodoro(item);
	}));
	this.prevNode = m.prop(data.prevNode || "");
	this.nextNode = m.prop(data.nextNode || "");
};

todo.task = function() {
	return m.request({ method: "GET", url: "/api/dnd/task", type: todo.TODO})
}

todo.today = function (data) {
	return m.request({ method: "GET", url: "/api/dnd/today", type: todo.TODO})
}

todo.move = (sourceid, targetid, isInter) => {
	return m.request({ method: "post", url: "/api/dnd/today", data: {
		sourceid: sourceid,
		targetid: targetid,
		isinter: isInter
	}})
}

todo.cancelTask = (id) => {
	return m.request({method: "delete", url: "/api/dnd/task", data: {id: id}});
}

todo.addTask = (name) => {
	return m.request({ method: "post", url: "/api/dnd/task", data: {name: name}});
}

todo.addPomo = function (id) {
	return m.request({method: "post", url: "/api/dnd/today/pomodoro", data: {id: id}});
}

todo.subPomo = (id) => {
	return m.request({method: "delete", url: "/api/dnd/today/pomodoro", data: {id: id}});
}

todo.startClock = (taskId, pomoId) => {
	return m.request({ method: 'put', url: "/api/dnd/today/pomodoro", data: {task: taskId, pomo: pomoId }});
}

module.exports = todo;