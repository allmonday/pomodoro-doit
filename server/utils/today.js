function today(time) {
    var today;
    if (time) {
        today = Date.parse(time);
    }
    today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var date = today.getDate();
    var hyphen = "-";
    return [year, month, date].join(hyphen);
}

module.exports = today;