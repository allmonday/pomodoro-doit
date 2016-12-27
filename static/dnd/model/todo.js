var m = require("mithril");
var pomodoro = require("./pomodoro");
var util = require("../utils/util");

var todo = {};
var global_runnable = false;

todo.TODO = function (data) {  // class
    let hasOneUnrunPomo = false || global_runnable;
	data = data || {};
	this._id = m.prop(data._id ||"");
	this.name = m.prop(data.name || "");
	this.nextNode = m.prop(data.nextNode || "");

    // calculated prop
	this.prevNode = m.prop(data.prevNode || "");
	this.pomodoros = m.prop((data.pomodoros || []).reduce((prev, item) => {
        let runnable = false;
        if (!hasOneUnrunPomo) { 
            runnable = (!item.status || util.isRunning(item.status, item.startTime));  // not start and running pomodo will take the only chance.
            if (runnable) { 
                hasOneUnrunPomo = true; 
                global_runnable = true;
            }
        } 
        item.runnable = runnable;
        prev.push(new pomodoro(item));
        return prev;
	}, []));
};

todo.task = function() {
    global_runnable = false;
	return m.request({ method: "GET", url: "/api/dnd/task"}).then((tasks) => {
        return tasks.reduce((prev, item) => {
            prev.push(new todo.TODO(item));
            return prev;
        }, []);
    });
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