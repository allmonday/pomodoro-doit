var moment = require("moment");

function today(time) {
    var today;
    /* istanbul ignore else  */
    if (time) {
        today = new Date(time);
    } else {
        today = new Date();
    }
    return moment(today).format("YYYY-MM-DD");
}

function yesterday(time) {
    var today;
    /* istanbul ignore else  */
    if (time) {
        today = new Date(time);
    } else {
        today = new Date();
    }
    return moment(today).subtract(1, 'day').format("YYYY-MM-DD");
}

module.exports = {
    today,
    yesterday
}