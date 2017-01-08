var m = require("mithril");
var pomodoro = require("./pomodoro");
var util = require("../utils/util");

var todo = {};
var global_runnable = false;
var running = {
    task: m.prop({}),
    pomodoro: m.prop({}),
    hasRunning: m.prop(false),
    totalPomodoroToday: m.prop(0),
    completedPomodoroToday: m.prop(0)
}

todo.resetRunningTask = () => {
    running.task({});
    running.pomodoro({});
    running.hasRunning(false);
    running.totalPomodoroToday(0);
    running.completedPomodoroToday(0);
}

todo.runningTask = function () {
    return running;
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

        if (data.assigned) { running.totalPomodoroToday(running.totalPomodoroToday() + 1); }

        let runnable = false;
        if (!hasOneUnrunPomo && data.assigned) { 
            let isRunning = util.isRunning(item.status, item.startTime);
            runnable = (!item.status || isRunning);  // not start and running pomodo will take the only chance.
            if (runnable) { 
                if (isRunning) {
                    running.task(data);
                    running.pomodoro(item);
                    running.hasRunning(true);
                }
                // set clock!
                hasOneUnrunPomo = true; 
                global_runnable = true;
            } else {
                // is finished
                running.completedPomodoroToday(running.completedPomodoroToday() + 1);
            }
        } 
        item.runnable = runnable;
        item.taskId = data._id;
        prev.push(new pomodoro(item));
        return prev;
	}, []));
};

todo.task = function(date) {
    global_runnable = false;
    todo.resetRunningTask();
	return m.request({ method: "GET", url: `/api/dnd/task/`}).then((tasks) => {
        return tasks.reduce((prev, item) => {
            prev.push(new todo.TODO(item));
            return prev;
        }, []);
    }) || [];
}

todo.today = function (date) {
    date = date || "";
	return m.request({ method: "GET", url: `/api/dnd/today?date=${date}`, type: todo.TODO}) || [];
}

todo.addTask = (name) => {
	return m.request({ method: "post", url: "/api/dnd/task", data: {name: name}});
}

todo.updateNote = (taskId, note) => {
    return m.request({ method: 'put', url: "/api/dnd/task", data: {_id: taskId, note: note}});
}

todo.removeTask = (taskId) => {
    return m.request({method: 'delete', url: "/api/dnd/task", data: {_id: taskId}});
}

todo.addTodayTask = (name, prevNode) => {
    return m.request({ method: 'post', url: "/api/dnd/task", data: { name: name, prevNode: prevNode}});
}

todo.move = (sourceid, targetid, isInter) => {
	return m.request({ method: "post", url: "/api/dnd/today", data: {
		sourceid: sourceid,
		targetid: targetid,
		isinter: isInter
	}})
}

todo.cancelTask = (id) => {
	return m.request({method: "delete", url: "/api/dnd/today", data: {id: id}});
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
	return m.request({ method: 'put', url: "/api/dnd/today/pomodoro", data: {taskId: taskId, pomodoroId: pomodoroId, validTime: validTime, interuptCount: interuptCount }});
}

todo.resetPomodoro = (taskId, pomodoroId) => {
	return m.request({ method: 'put', url: "/api/dnd/today/pomodoro/state", data: {taskId: taskId, pomodoroId: pomodoroId}});
}

module.exports = todo;