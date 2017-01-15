var util = require("../../static/dnd/utils/util");
var chai = require("chai");
var expect = chai.expect;

describe("pomodoro util", function () {
    describe("test prefix zero", function () {
        expect(util.prefix_zero(1)).to.equal('01');
    });
})

