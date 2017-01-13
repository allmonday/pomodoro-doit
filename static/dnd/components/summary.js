var m = require("mithril");
var markdown = require("markdown").markdown;

var summary = {
    controller: function (data) {
        let vm = this;
        vm.today = data.today;
    },
    view: function(vm) {
        return m("#summary-modal.ui.modal", [
            m(".ui.icon.header", [
                m("p", "Summary of today")
            ]),
            m(".content", [
                m(".description", [
                    m(".ui.header.tiny", `total tasks:  ${vm.today().length }`),
                    m(".ui.header.tiny", `total pomodoros:  ${vm.today().reduce((prev, item) => { return prev + item.pomodoros().length }, 0)}`),
                    m(".ui.header.tiny", `finished pomodoros:  ${vm.today().reduce((prev, item) => { return prev + item.pomodoros().filter((item)=>{ return item.isFinished();}).length }, 0)}`),
                    m(".ui.header", "Details"),
                    m("div", [
                        vm.today().map((t) => {
                            return m(".ui.segment", [
                                m(".ui.header.medium", t.name()),
                                m(".ui.header.tiny", "Status"),
                                m("p", `${t.pomodoros().filter((p) => { return p.isFinished()}).length} / ${t.pomodoros().length}`),
                                m(".ui.header.tiny", "note:"),
                                t.note() ? m("div", m.trust(markdown.toHTML(t.note()))): m("p","no content")
                            ])
                        })       
                    ])
                ])
            ]),
            m(".actions", [
                m(".ui.green.ok.inverted.button", [
                    m("span", "Close")
                ])
            ])
        ])
    }
}

module.exports = summary;