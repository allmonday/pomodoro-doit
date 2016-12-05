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
    return m("div", [
        m("p", "Task Today"),
        m("ul.list-unstyled", [
            app.Today.vm.list().map(function (today, index) {
                return m("li", [
                    m("button.btn.btn-default", today.name()),
                    m("ul", [
                        today.clocks().map(function (pomo, index) {
                            return m("li", "pomodoro")
                        })
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

