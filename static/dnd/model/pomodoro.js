var m = require("mithril");
var util = require("../utils/util");

var pomodoro = function (data) {
	data = data || {};
	this._id = m.prop(data._id || "");
	this.status = m.prop(data.status || false);
	this.startTime = m.prop(data.startTime || "");
    this.interuptCount = m.prop(data.interuptCount || 0);
    this.validTime = m.prop(data.validTime || 0);
	this.runnable = m.prop(data.runnable || false);
}

pomodoro.prototype.isFinished = function() {
	return this.status && util.isFinished(this.startTime());
}
pomodoro.prototype.hasStarted = function () {
	return !!this.startTime();
}

module.exports = pomodoro;