var m = require("mithril");
var app = {};


app.Task = function (data) {
    this.name = m.prop(data.name || "");
    this.completed = m.prop(data.completed || "");
}

app.Task.list = function (data) {
    return m.request({method: "GET", url:"/api/pomodoro/task", type: app.Task});
}

app.Today = function (data) {
    this.id = m.prop(data.id || "");
    this.name = m.prop(data.name || "");
    this.completed = m.prop(data.completed || "");
    this.clocks = m.prop(data.clocks || []);
}

app.Today.list = function (data) {
    return m.request({method: "GET", url:"/api/pomodoro/today", type: app.Today});
}

app.Clock = function (data) {
    this.time = m.prop(data.time || new Date());
} 

module.exports = app;