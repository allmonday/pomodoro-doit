var m = require("mithril");


var diary = function (data) {
    this.id = m.prop(data.id || "");
    this.content = m.prop(data.content || "")
    this.tags = m.prop(data.tags || [])
}

module.exports = diary;