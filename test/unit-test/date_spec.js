var server = "../../server/"
var today = require(server + "utils/today").today;
var yesterday = require(server + "utils/today").yesterday;
var chai = require("chai");
var expect = chai.expect;

describe('Utils', function() {
  describe('date getter', function() {
    it('should get today year-month-date', function() {
      var t = "2016/12/5 12:11:21";
      expect(today(t)).to.equal("2016-12-05");
    });

    it('should get yesterdays year-month-date', function() {
      var t = "2016/12/5 12:11:21";
      expect(yesterday(t)).to.equal("2016-12-04");
    });

  });
});