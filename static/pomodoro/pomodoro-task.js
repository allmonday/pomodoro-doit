var app = require("./pomodoro");
var m = require("mithril");

app.Task.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = app.Task.list();
        vm.move = function (index) {
            console.log(index);
        }
    };
    return vm;
})();

app.Task.controller = function () {
    app.Task.vm.init();
};

app.Task.view = function (ctrl) {
    return m(".task-list", [
        m("p", "task list"),
        m("ul.list-unstyled", [
            m("li", [
                m("div.btn.btn-default.btn-block", [
                    m("span.glyphicon.glyphicon-plus")
                ])
            ]),
            app.Task.vm.list().map(function (task, index) {
                return m("li", [
                    m("div.btn.btn-default.btn-block", {
                        onclick: app.Task.vm.move.bind(this, index)
                    },[
                        m("span", task.name()),
                        m("span.glyphicon.glyphicon-chevron-right")
                    ])
                ])
            })
        ]),
    ])
    
};

m.mount(document.getElementsByTagName("task-list")[0], {
    controller: app.Task.controller,
    view: app.Task.view
});

