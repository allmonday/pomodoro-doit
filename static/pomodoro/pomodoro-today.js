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
            app.Today.vm.list().map(function (Today, index) {
                return m("li", [
                    m("button.btn.btn-default", Today.name())
                ])
            })
        ])
    ])
    
};

m.mount(document.getElementsByTagName("task-today")[0], {
    controller: app.Today.controller,
    view: app.Today.view
});

