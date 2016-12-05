var assert = require('assert');
var today = require("../server/utils/today");

describe('Utils', function() {
  describe('today', function() {
    it('should get year-month-date', function() {
      var t = "Mon Dec 05 2016 15:52:17 GMT+0800 (CST)"
      assert.equal(today(t), "2016-12-5");
    });
  });
});