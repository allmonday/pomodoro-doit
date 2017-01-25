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
        formatted: `${prefix_zero(minutes)} : ${prefix_zero(left_seconds)}`,
        minutes: minutes,
        seconds: left_seconds,
        percent: percent,
        reversedFormatted: `${prefix_zero(reversed_minutes)} : ${prefix_zero(reversed_seconds)}`,
        reversedFormattedForTitle: `${prefix_zero(reversed_minutes)}:${prefix_zero(reversed_seconds)}`
    }
}

function minToHour(num) {
    let minutes = num % 60;
    let hours = Math.floor(num/60);
    return `${prefix_zero(hours)} HOURS, ${prefix_zero(minutes)} MINUTES`;
}

function requireNotificationPermission () {
  if(typeof window.Notification === 'undefined') {
      return;
  }
  if (Notification.permission !== "granted") Notification.requestPermission(); 
}

function notifyMe(name) {
  if(typeof window.Notification === 'undefined') {
      return;
  }
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Take a break!', {
    //   requireInteraction: true,
      icon: '/imgs/tomato.png',
      body: name,
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

function dragIgnore (element) {
    element.addEventListener("dragover", deactivate)
    element.addEventListener("dragleave", deactivate)
    element.addEventListener("dragend", deactivate)
    function deactivate(e) {}
}

function calTomorrowTimeout() {
    let tomorrow = moment().add(1, 'day');
    let year = tomorrow.year();
    let month = tomorrow.month();
    let date = tomorrow.date();
    let tomorrowMoment = moment({year: year, month: month, date: date});
    return tomorrowMoment.diff(moment());
}

var log = console.log.bind(console);

function logError(errResponse) {
    toastr.error(errResponse.error);
}
var title = "Pomodoro do it!!";

var socket = io.connect();

function formatSeconds(seconds) {
    var seconds_left = seconds % 60
    var minutes = Math.floor(seconds / 60);
    return `${prefix_zero(minutes)} : ${prefix_zero(seconds_left)}`;
}

function getPct(val) {
    var r = 90;
    var c = Math.PI*(r*2);

    if (val < 0) { val = 0;}
    if (val > 100) { val = 100;}
    
    var pct = (val/100)*c;
    return pct;
}

function setShowItem (bool) {
    localStorage.setItem('show', bool);
}
function getShowItem () {
    var val = localStorage.getItem("show");

    if (val === null) {
        return false;
    }
    if (val === 'true') {
        return true;
    }
    if (val === 'false') {
        return false;
    }
}

function djb2(str){
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  var hash = djb2(str);
  var r = (hash & 0xff0000) >> 16;
  var g = (hash & 0x00ff00) >> 8;
  var b = hash & 0x0000ff;
  return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
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
    calTomorrowTimeout,
    log,
    logError,
    title,
    socket,
    formatSeconds,
    getPct,
    setShowItem,
    getShowItem,
    hashStringToColor,
    dragIgnore
}