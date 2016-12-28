var m = require("mithril");
var pomodoro = require("./pomodoro");
var util = require("../utils/util");

var todo = {};
var global_runnable = false;
var running = {
    task: m.prop({}),
    pomodoro: m.prop({}) 
}

todo.runningTask = function () {
    return running;
}
todo.resetRunningTask = () => {
    running.task({});
    running.pomodoro({});
}

todo.TODO = function (data) {  // class
    let hasOneUnrunPomo = false || global_runnable;
	data = data || {};
	this._id = m.prop(data._id ||"");
	this.name = m.prop(data.name || "");
	this.nextNode = m.prop(data.nextNode || "");
    this.note = m.prop(data.note || "");

    // calculated prop
	this.prevNode = m.prop(data.prevNode || "");
	this.pomodoros = m.prop((data.pomodoros || []).reduce((prev, item) => {
        let runnable = false;
        if (!hasOneUnrunPomo) { 
            let isRunning = util.isRunning(item.status, item.startTime);
            runnable = (!item.status || isRunning);  // not start and running pomodo will take the only chance.
            if (runnable) { 
                if (isRunning) {
                    running.task(data);
                    running.pomodoro(item);
                }
                // set clock!
                hasOneUnrunPomo = true; 
                global_runnable = true;
            }
        } 
        item.runnable = runnable;
        item.taskId = data._id;
        prev.push(new pomodoro(item));
        return prev;
	}, []));
};

todo.task = function() {
    global_runnable = false;
    todo.resetRunningTask();
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

todo.updateNote = (taskId, note) => {
    return m.request({ method: 'put', url: "/api/dnd/task", data: {_id: taskId, note: note}});
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
	return m.request({ method: 'put', url: "/api/dnd/today/pomodoro/start", data: {task: taskId, pomo: pomoId }});
}

todo.updatePomodoro = (taskId, pomodoroId, validTime, interuptCount) => {
    console.log(taskId, pomodoroId)
	return m.request({ method: 'put', url: "/api/dnd/today/pomodoro", data: {taskId: taskId, pomodoroId: pomodoroId, validTime: validTime, interuptCount: interuptCount }});
}

module.exports = todo;