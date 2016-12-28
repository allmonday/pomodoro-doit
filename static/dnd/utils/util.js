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
    seconds = seconds - 60 * minutes;
    return {
        formatted: `${minutes} minutes and ${seconds} seconds`,
        minutes: minutes,
    }
}


module.exports = {
    isFinished,
    isRunning,
    elapsed
}