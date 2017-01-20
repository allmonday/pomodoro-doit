var m = require("mithril");
var util = require("../utils/util");
var widget = require("../app");
require("./rest.scss");

var rest = {
    controller: function update(data) {
        util.log("rest clock init");
        let vm = this;
        vm.total = m.prop(300);
        vm.getPct = util.getPct;

        var ref;
        var bindUpdate = update.bind(vm);

        vm.displayTime = m.prop("");
        widget.service.refreshRestClock = function() {
            clearTimeout(ref);
            bindUpdate();
        }

        function count() {
            if (vm.total() >= 0) {
                vm.displayTime(util.formatSeconds(vm.total()));
                m.endComputation();
                vm.total(vm.total() - 1);
                ref = setTimeout(count, 1000);
            } else {
                $("#rest-modal.ui.basic.modal").modal("hide");
            }
        }
        count();
    },
    view: function(vm) {
        return m("#rest-modal.ui.modal.basic", [
            m(".content", [
                m(".pomodoro-clock_view_progress", [
                    m("#pomodoro-pct", {
                        'data-pct': vm.displayTime() 
                    }, [
                        m("svg[width='200'][height='200'][viewPort='0 0 100 100'].pomodoro-clock-circle", [
                            m("circle[r='90'][cx='100'][cy='100'][fill='transparent'][stroke-dasharray='565.48'][stroke-dashoffset='0']", {
                            }),
                            m(`circle[id="bar"][r="90"][cx="100"][cy="100"][fill="transparent"][stroke-dasharray="565.48"][stroke-dashoffset="0"][transform=rotate(270, 100, 100)]`,{
                                style: `stroke-dashoffset: ${vm.getPct((300 -  vm.total()) / 3)}px;`
                            })
                        ])
                    ]),
                ])
            ]),
        ])
    }
}

module.exports = rest;