function today(time) {
    var today;
    if (time) {
        today = Date.parse(time);
    }
    today = new Date();
    var year = today.getFullYear();
    var month = prefixZero(today.getMonth() + 1);
    var date = prefixZero(today.getDate());
    var hyphen = "-";
    return [year, month, date].join(hyphen);
}

function prefixZero(number) {
    if (number < 10) {
        return `0${number}`;
    } else {
        return `${number}`;
    }
}

module.exports = today;