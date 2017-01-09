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
function prefix_zero(num) {
    if (num <= 9) {
        return '0' + num;
    } else {
        return `${num}`;
    }
}

function elapsed(date) {
    let minutes = moment().diff(date, 'minute'); 
    let seconds = moment().diff(date, 'second');
    let percent = seconds / (25 * 60) * 100;
    let left_seconds = seconds - 60 * minutes;

    let rev_seconds = moment(date).add(25, 'minute').diff(new Date, 'second');
    let reversed_seconds = rev_seconds % 60;
    let reversed_minutes = Math.floor(rev_seconds / 60);

    return {
        formatted: `${prefix_zero(minutes)} : ${prefix_zero(left_seconds)}`,
        minutes: minutes,
        seconds: left_seconds,
        percent: percent,
        reversedFormatted: `${prefix_zero(reversed_minutes)} : ${prefix_zero(reversed_seconds)}`
    }
}

function minToHour(num) {
    let minutes = num % 60;
    let hours = Math.floor(num/60);
    return `${prefix_zero(hours)}h, ${prefix_zero(minutes)}m`;
}

function requireNotificationPermission () {
  if (Notification.permission !== "granted") Notification.requestPermission(); 
}

function notifyMe(name) {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('pomodoro finished', {
      icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: `pomodoro of ${name} has finished! take a break`,
    });
    notification.onclick = function () {
        window.focus(); 
        setTimeout(notification.close(notification), 200);
    };
  }
}

module.exports = {
    isFinished,
    isRunning,
    elapsed,
    minToHour,
    notifyMe,
    requireNotificationPermission
}