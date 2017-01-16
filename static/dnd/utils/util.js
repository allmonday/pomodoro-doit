"use strict";
// var moment = require("moment");
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
        formatted: `${prefix_zero(minutes)}:${prefix_zero(left_seconds)}`,
        minutes: minutes,
        seconds: left_seconds,
        percent: percent,
        reversedFormatted: `${prefix_zero(reversed_minutes)}:${prefix_zero(reversed_seconds)}`
    }
}

function minToHour(num) {
    let minutes = num % 60;
    let hours = Math.floor(num/60);
    return `${prefix_zero(hours)}hours and ${prefix_zero(minutes)}minutes`;
}

function requireNotificationPermission () {
  if (Notification.permission !== "granted") Notification.requestPermission(); 
}

function notifyMe(name) {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Times UP!', {
      requireInteraction: true,
      icon: '/imgs/tomato.png',
      body: `Take a break~`,
    });
    notification.onclick = function () {
        window.focus(); 
        setTimeout(notification.close(notification), 200);
    };
  }
}

function isTop(e) {
    let cursorY = e.offsetY,  // offsetY to object
        clientHeight = e.target.clientHeight,  // container height
        half = clientHeight / 2;

	let result = cursorY <= half;
    console.log(result);
	return result;
}

function dragdrop(element, options) {
    options = options || {}

    element.addEventListener("dragover", activate)
    element.addEventListener("dragleave", deactivate)
    element.addEventListener("dragend", deactivate)

    function activate(e) {
		e.target.classList.add("over");
		let top = isTop(e);
		e.target.classList.remove('drag-top', 'drag-bottom');
		e.target.classList.add(top? 'drag-top': 'drag-bottom');
        e.preventDefault()
    }
    function deactivate(e) { 
		e.target.classList.remove("over");
	}
}

function calTomorrowTimeout() {
    let tomorrow = moment().add(1, 'day');
    let year = tomorrow.year();
    let month = tomorrow.month();
    let date = tomorrow.date();
    let tomorrowMoment = moment({year: year, month: month, date: date});
    return tomorrowMoment.diff(moment());
}

module.exports = {
    isFinished,
    isRunning,
    elapsed,
    prefix_zero,
    minToHour,
    notifyMe,
    requireNotificationPermission,
    isTop,
    dragdrop,
    calTomorrowTimeout
}