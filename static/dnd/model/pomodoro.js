var m = require("mithril");
var util = require("../utils/util");

var pomodoro = function (data) {
	data = data || {};
	this._id = m.prop(data._id || "");
	this.status = m.prop(data.status || false);
	this.startTime = m.prop(data.startTime || "");
    this.interuptCount = m.prop(data.interuptCount || 0);
    this.validTime = m.prop(data.validTime || 0);

	// calculated prop
	this.runnable = m.prop(data.runnable || false);
	this.taskId = m.prop(data.taskId || "");
}

pomodoro.prototype.isFinished = function() {
	return this.status && util.isFinished(this.startTime());
}

pomodoro.prototype.hasStarted = function () {
	return !!this.startTime();
}

pomodoro.prototype.isRunning = function () {
	return this.hasStarted() && !this.isFinished();
}

pomodoro.prototype.currentStatus = function () {
	if (!this.hasStarted()) {
		return "prepare";
	} else if (this.isRunning()) {
		return "running";
	} else {
		return "finished"
	}
}

module.exports = pomodoro;