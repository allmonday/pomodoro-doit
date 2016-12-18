var m = require("mithril");

var pomo = {
    controller: function (data) {
        this.pomolist = data.pomo;
    },
    view: function (ctrl) {
        return m(".pomo", [
            ctrl.pomolist.map(function (item) {
                return m(".pomo-item", `clock-${item.status}`);
            })
        ])
    }
}

module.exports = pomo;