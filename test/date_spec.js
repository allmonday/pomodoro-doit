var today = require("../server/utils/today");
var chai = require("chai");
var expect = chai.expect;

describe('Utils', function() {
  describe('today', function() {
    it('should get year-month-date', function() {
      var t = "2016/12/5 12:11:21";
      expect(today(t)).to.equal("2016-12-05");
    });
  });
});