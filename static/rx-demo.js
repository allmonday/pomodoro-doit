var Rx = require("rx");
var $ = require("jquery");

var $input = $("#input"),
  $results = $("#result");


var keyups = Rx.Observable.fromEvent($input, 'keyup')
  .map(e => e.target.value)
  .filter(text => text.length > 2);

var throttled = keyups.throttle(400);

var distinct = throttled.distinctUntilChanged();

function searchWikipedia (term) {
    return $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        dataType: 'jsonp',
        data: {
            action: 'opensearch',
            format: 'json',
            search: term
        }
    }).promise();
}

var suggestions = distinct.flatMapLatest(searchWikipedia);

suggestions.subscribe(data => {
    var res = data[1];

    /* Do something with the data like binding */
    $results.empty();

    $.each(res, (_, value) => $('<li>' + value + '</li>').appendTo($results));
}, error => {
    /* handle any errors */
    $results.empty();

    $('<li>Error: ' + error + '</li>').appendTo($results);
});


var obs = Rx.Observable.create(function (observer) {
    $(".button").on("click", (e) => {
        observer.next(e);
    });
});
obs.scan(count => count +1, 0)
    .subscribe(count => console.log(count));