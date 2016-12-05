app.Task.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = app.Task.list();
    };
    return vm;
})();

app.Task.controller = function () {
    app.Task.vm.init();
};

app.Task.view = function (ctrl) {
    return m("div", [
        m("p", "task list"),
        m("ul.list-unstyled", [
            app.Task.vm.list().map(function (task, index) {
                return m("li", [
                    m("button.btn.btn-default", task.name())
                ])
            })
        ]),
        m("hr"),
    ])
    
};

m.mount(document.getElementsByTagName("task-list")[0], {
    controller: app.Task.controller,
    view: app.Task.view
});

