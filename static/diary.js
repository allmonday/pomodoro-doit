var m = require("mithril");
var diaryModel = require("./diary/model/diary.js")
require("./diary.scss");

var diary = {}

diary.controller = function (data) {
    let vm = this;
}

diary.view = function (vm) {
    return m("#pomodoro-diary-container", [
        m("#pomodoro-diary-date", "date"),
        m("#pomodoro-diary-content", "date"),
        m("#pomodoro-diary-task", "date"),
    ])
}

m.mount(document.querySelector("#pomodoro-diary"), diary);