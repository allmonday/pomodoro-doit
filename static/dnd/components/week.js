var m = require("mithril");
var util = require("../utils/util");
var todo = require("../model/todo");

var week = {
    controller: function () {
        util.log("week init");
        let vm = this;
        vm.week = todo.getWeekData();
        vm.draw = function (ctx, init, content) {
            if (!init) {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: vm.week().map(item => item.x),
                        datasets: [{
                            data: vm.week().map(item => item.y),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        width: 20,
                        scales: {
                            xAxes: [{
                                type: 'time',
                                categoryPercentage: 0.11,
                                barPercentage: 1.8,
                                time: {
                                    isoWeekday: true,
                                    displayFormats: {
                                        week: 'll'
                                    },
                                    min: moment().subtract(7, 'day').endOf('day').toDate(),
                                    max: moment().endOf('day').toDate(),
                                    unit: 'day'
                                }
                            }],
                            yAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });

            }
        }
    }, 
    view: function (vm) {
        return m("canvas#pomodoro-week-chart[width='400'][height='180']", {
            config: vm.draw 
        })
    }
}

module.exports = week;