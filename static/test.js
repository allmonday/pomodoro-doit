var todo = {};

todo.Todo = function (data) {
    this.description = m.prop(data.description);
    this.done = m.prop(false);
};

todo.TodoList = Array;

todo.vm = (function () {
    var vm = {};
    vm.init = function () {
        vm.list = new todo.TodoList();
        vm.description = m.prop("");
        vm.add = function () {
            if (vm.description()) {
                vm.list.push(new todo.Todo({ description: vm.description()}))
                vm.description("");
            }
        };
        vm.delete = function (idx) {
            vm.list.splice(idx, 1);
        }
    }
    return vm;
}());

todo.controller = function () {
    todo.vm.init();
}

todo.view = function() {
    return m("html", [
        m("body", [
            m("h2", "todo list"),
            m("input", {value: todo.vm.description(), onchange: m.withAttr("value", todo.vm.description)}),
            m("button",{ onclick: todo.vm.add } , "Add"),
            m("table", [
                todo.vm.list.map(function (task, index) {
                    return m("tr", [
                        m("td", [
                            m("input[type=checkbox]", { onclick: m.withAttr("checked", task.done), checked: task.done()})
                        ]),
                        m("td", {style: {textDecoration: task.done()? "line-through": "none"}}, task.description()),
                        m("td", [
                            m("button", {value: "delete", onclick: todo.vm.delete.bind(this, index) }, "delete")
                        ])
                    ])
                })
            ])
        ])
    ]);
};

m.mount(document.getElementsByTagName("todo")[0], 
    { controller: todo.controller, view: todo.view });