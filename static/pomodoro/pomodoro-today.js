var app = require("./pomodoro");
var m = require("mithril");

app.Today.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = app.Today.list();
    };
    return vm;
})();


app.Today.controller = function () {
    app.Today.vm.init();
};

app.Today.view = function (ctrl) {
    return m(".task-today", [
        m("p", "Task Today"),
        m("ul.list-unstyled", [
            app.Today.vm.list().map(function (today, index) {
                return m("li", [
                    m("div.btn.btn-default.btn-block", today.name()),
                    m(".task-today_task-block", [
                        m("ul.list-unstyled", [
                            today.clocks().map(function (pomo, index) {
                                return m("li.btn.btn-default.btn-block", "pomodoro")
                            })
                        ])
                    ])
                ])
            })
        ])
    ])
    
};

m.mount(document.getElementsByTagName("task-today")[0], {
    controller: app.Today.controller,
    view: app.Today.view
});

