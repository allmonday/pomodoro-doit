var moment = require("moment");

function isFinished(date, range) {
    range = range || 25;
    if (date) {
        return moment(date).add(range, 'minute').isBefore();
    } else {
        return false;
    }
}

function isRunning(status, date, range) {
    range = range || 25;
    if (!status) {
        return false;
    } else {
        return !isFinished(date, range);  // is running and has not finished
    }
}

function elapsed(date) {
    let minutes = moment().diff(date, 'minute'); 
    let seconds = moment().diff(date, 'second');
    let percent = seconds / (25 * 60) * 100;
    let left_seconds = seconds - 60 * minutes;

    return {
        formatted: `${minutes<=9 ? '0'+minutes: minutes} : ${left_seconds<=9 ? '0'+left_seconds: left_seconds}`,
        minutes: minutes,
        percent: percent,
    }
}


module.exports = {
    isFinished,
    isRunning,
    elapsed
}