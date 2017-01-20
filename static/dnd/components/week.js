var m = require("mithril");
var util = require("../utils/util");
var todo = require("../model/todo");
require("./week.scss");

var week = {
    controller: function () {
        util.log("week init");
        let vm = this;
        vm.week = todo.getWeekData();
        vm.draw = function (ctx, init, content) {
            if (!init) {
                let data = vm.week();

                var svg = d3.select("svg#pomodoro-week-chart-area"),
                    margin = {top: 20, right: 20, bottom: 30, left: 40},
                    width = +svg.attr("width") - margin.left - margin.right,
                    height = +svg.attr("height") - margin.top - margin.bottom;

                var x = d3.scaleBand().rangeRound([0, width]).padding(0.3),
                    y = d3.scaleLinear().rangeRound([height, 0]);

                var g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                x.domain(data.map(function(d) { return d.x; }));
                y.domain([0, d3.max(data, function(d) { return d.y; })]);

                g.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));

                g.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.x); })
                    .attr("y", function(d) { return y(d.y); })
                    .attr("width", x.bandwidth())
                    .attr("height", function(d) { return height - y(d.y); });

            }
        }
    }, 
    view: function (vm) {
        return m("#pomodoro-week-chart", {
            config: vm.draw 
        }, [
            m("svg#pomodoro-week-chart-area[width='400'][height='250']")
        ])
    }
}

module.exports = week;