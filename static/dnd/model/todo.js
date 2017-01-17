var m = require("mithril");
var pomodoro = require("./pomodoro");
var util = require("../utils/util");
var today = require("../utils/today").today();

var todo = {};

var has_running_task = false;
var global_has_one_runnable = false;  // for today, flag one runnable pomo is found.

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
    this.fixedTop = m.prop(data.fixedTop || false);

    //computed prop
    this.finished = m.prop(_.every(data.pomodoros, { status: true }));
};

todo.TODAY = function (data) {  // class for today tasks

	data = data || {};
	this._id = m.prop(data._id ||"");
	this.name = m.prop(data.name || "");
	this.nextNode = m.prop(data.nextNode || "");
    this.note = m.prop(data.note || "");
    this.assigned = m.prop(data.assigned || false);
    this.isToday = m.prop(data.date === today);

    // computed prop
    this.finished = m.prop(_.every(data.pomodoros, { status: true }));
	this.prevNode = m.prop(data.prevNode || "");
    let that = this;
    that.isRunning = m.prop(false);
	this.pomodoros = m.prop((data.pomodoros || []).reduce((prev, item) => {
        // if not today, just initialize pomodoro, bypass other logics, previous tasks are not runnable anymore.
        item.taskId = data._id;

        // not today, disable all
        if (data.date !== today) {
            prev.push(new pomodoro(item));
            return prev;
        }

        let pomoInstance = new pomodoro(item);

        if (has_running_task) {  // if one task is running, use default runnable false (ref to model).

            // find the running one
            if (pomoInstance.currentStatus() === 'running') {
                running.task(data);
                running.pomodoro(item);
                running.hasRunning(true);
                that.isRunning(true);
            }

        } else {  // find the first prepare pomodoro

            if (!global_has_one_runnable) {  // if already found, ignore
                if (pomoInstance.currentStatus() === 'prepare') {
                    global_has_one_runnable = true;
                    pomoInstance.runnable(true);
                }
            } 
        }

        prev.push(pomoInstance);

        // calculate count only for today
        running.totalPomodoroToday(running.totalPomodoroToday() + 1);
        if (pomoInstance.isFinished()) { running.completedPomodoroToday(running.completedPomodoroToday() + 1); }

        return prev;
	}, []));
};

todo.task = function(date) {
    return m.request({ method: "GET", url: `/api/pomodoro/task/`, type: todo.TODO, initialValue: []});
}

todo.today = function (date) {
    // init
    has_running_task = false;
    global_has_one_runnable = false;
    todo.resetRunningTask();
    date = date || "";

	return m.request({ method: "GET", url: `/api/pomodoro/today?date=${date}`, initialValue: []})
        .then(function (data) {
            let pomodoros = data.reduce((prev, item) => { return prev.concat(item.pomodoros);}, []);
            let runningPomodoro = pomodoros.filter((item) => { return util.isRunning(item.status, item.startTime); });            
            if (runningPomodoro.length > 0) {  // > 0, but actually it should be 1
                has_running_task = true
            }
            return data.map((item) => {return new todo.TODAY(item) });
        });
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