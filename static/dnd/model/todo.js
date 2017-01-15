var m = require("mithril");
var pomodoro = require("./pomodoro");
var util = require("../utils/util");
var today = require("../utils/today").today();

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

todo.TODO = function (data) {  // class for tasks
	this._id = m.prop(data._id ||"");
	this.name = m.prop(data.name || "");
    this.note = m.prop(data.note || "");
    this.assigned = m.prop(data.assigned || false);
    this.finished = m.prop(_.every(data.pomodoros, { status: true }));
    this.fixedTop = m.prop(data.fixedTop || false);
};

todo.TODAY = function (data) {  // class for today tasks
    let hasOneUnrunPomo = false || global_runnable;
	data = data || {};
	this._id = m.prop(data._id ||"");
	this.name = m.prop(data.name || "");
	this.nextNode = m.prop(data.nextNode || "");
    this.note = m.prop(data.note || "");
    this.assigned = m.prop(data.assigned || false);
    this.isToday = m.prop(data.date === today);

    // computed prop
	this.prevNode = m.prop(data.prevNode || "");
    let that = this;
    that.isRunning = m.prop(false);
	this.pomodoros = m.prop((data.pomodoros || []).reduce((prev, item) => {

        // if not today, just initialize pomodoro, bypass other logics
        // previous tasks are not runnable anymore.
        if (data.date !== today) {
            item.runnable = false;
            item.taskId = data._id;
            prev.push(new pomodoro(item));
            return prev;
        }
        
        running.totalPomodoroToday(running.totalPomodoroToday() + 1);

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
                that.isRunning(true);
            }
        } 

        item.runnable = runnable;
        item.taskId = data._id;
        let pomoInstance = new pomodoro(item);
        prev.push(pomoInstance);

        if (pomoInstance.isFinished()) {
            running.completedPomodoroToday(running.completedPomodoroToday() + 1);
        }
        return prev;
	}, []));
};

todo.task = function(date) {
    return m.request({ method: "GET", url: `/api/pomodoro/task/`, type: todo.TODO, initialValue: []});
}

todo.today = function (date) {
    global_runnable = false;
    todo.resetRunningTask();
    date = date || "";
	return m.request({ method: "GET", url: `/api/pomodoro/today?date=${date}`, type: todo.TODAY, initialValue: []})
}

todo.addTask = (name) => {
	return m.request({ method: "post", url: "/api/pomodoro/task", data: {name: name}});
}

todo.updateNote = (taskId, note) => {
    return m.request({ method: 'put', url: "/api/pomodoro/task", data: {_id: taskId, note: note}});
}

todo.removeTask = (taskId) => {
    return m.request({method: 'delete', url: "/api/pomodoro/task", data: {_id: taskId}})
        .then(() => {
            toastr.success("deleted");
        });
}

todo.addTodayTask = (name, prevNode) => {
    return m.request({ method: 'post', url: "/api/pomodoro/task", data: { name: name, prevNode: prevNode}});
}

todo.move = (sourceid, targetid, isInter) => {
	return m.request({ method: "post", url: "/api/pomodoro/today", data: {
		sourceid: sourceid,
		targetid: targetid,
		isinter: isInter
	}})
}

todo.cancelTask = (id) => {
    return m.request({method: "delete", url: "/api/pomodoro/today", data: {id: id}})
}

todo.addPomo = function (id) {
	return m.request({method: "post", url: "/api/pomodoro/today/pomodoro", data: {id: id}});
}

todo.subPomo = (id) => {
	return m.request({method: "delete", url: "/api/pomodoro/today/pomodoro", data: {id: id}});
}

todo.startClock = (taskId, pomoId) => {
	return m.request({ method: 'put', url: "/api/pomodoro/today/pomodoro/start", data: {task: taskId, pomo: pomoId }});
}

todo.updatePomodoro = (taskId, pomodoroId, validTime, interuptCount) => {
	return m.request({ method: 'put', url: "/api/pomodoro/today/pomodoro", data: {taskId: taskId, pomodoroId: pomodoroId, validTime: validTime, interuptCount: interuptCount }});
}

todo.resetPomodoro = (taskId, pomodoroId) => {
	return m.request({ method: 'put', url: "/api/pomodoro/today/pomodoro/state", data: {taskId: taskId, pomodoroId: pomodoroId}});
}

module.exports = todo;