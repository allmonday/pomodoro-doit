var argv = require("minimist")(process.argv.slice(2));
var mongoose = require("mongoose");
var config = require("../../config");

console.log("mongourl: " + process.env.MONGOURL);
var mongourl = process.env.MONGOURL || argv.mongourl || "mongodb://localhost:27017/pomodoro";
try {
    mongoose.connect(mongourl);
} catch (e) {
    // mocha test will cause open unclosed connection
}
var db = mongoose.connection;

module.exports = db;