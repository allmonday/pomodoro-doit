var m = require("mithril");
var clockObserver = require("./clockObserver");

var pomo = {
    controller: function (data) {
        this.pomolist = data.item.pomodoros();
        this.id = data.item._id();
        this.start = data.start;
    },
    view: function (ctrl) {
        return m(".pomo", [
            ctrl.pomolist.map(function (item) {
                return m(".pomo-item", [
                    m(".pomo-title", `clock-${item.status}`),
                    m(".pomo-title", `clock-${item.startTime}`),
                    m("button", {
                        onclick: () => {
                            ctrl.start(ctrl.id, item._id);
                            clockObserver.next({
                                task: ctrl.id,
                                pomodoro: item._id
                            })
                        }                        // onclick: console.log.bind(null, "click")
                    }, "start") 
                ]);
            })
        ])
    }
}

module.exports = pomo;