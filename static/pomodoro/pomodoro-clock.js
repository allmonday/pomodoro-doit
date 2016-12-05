var app = require("./pomodoro");
var m = require("mithril");

app.Clock.vm = (function () {
    var vm = {};
    vm.init = function () {
    };
    return vm;
})();

app.Clock.controller = function () {
    app.Clock.vm.init();
};

app.Clock.view = function (ctrl) {
    return m(".pomodoro", [
        m("p", "clock"),
        m("p", "23:11")
    ])
};

m.mount(document.getElementsByTagName('pomodoro')[0], {
    controller: app.Clock.controller,
    view: app.Clock.view
});

