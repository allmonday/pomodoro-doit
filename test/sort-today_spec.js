var sortToday = require("../server/utils/sort-today");
var chai = require("chai");
var expect = chai.expect;

describe('Utils', function() {
  describe('sort-today', function() {
    it('can handle empty input', function() {
        var input = [];
        expect(sortToday(input)).to.be.empty;
    });

    it('can handle one element input', function() {
        var input = [{
            _id: 100,
            content: 'whatever',
            nextNode: null,
            isHead: true     
        }];
        expect(sortToday(input)).to.eql([{
            _id: 100,
            content: 'whatever',
            nextNode: null,
            isHead: true,
            prevNode: ''  // one more
        }]);
    });

    it('can handle more elements', function() {
        var input = [{
            _id: 100,
            content: 'whatever',
            nextNode: 200,
            isHead: true     
        }, {
            _id: 200,
            content: 'whatever2',
            nextNode: null,  // or ''
            isHead: false
        }];

        expect(sortToday(input)).to.eql([{
            _id: 100,
            content: 'whatever',
            nextNode: 200,
            isHead: true,
            prevNode: ''  // one more
        },{
            _id: 200,
            content: 'whatever2',
            nextNode: null,
            isHead: false,
            prevNode: 100  // one more
        }]);
    });

    it('set last element nextNode null if it is not null', function () {
        var input = [{
            _id: 100,
            content: 'whatever',
            nextNode: 200,
            isHead: true     
        }, {
            _id: 200,
            content: 'whatever2',
            nextNode: 300,  // or ''
            isHead: false
        }];

        expect(sortToday(input)).to.eql([{
            _id: 100,
            content: 'whatever',
            nextNode: 200,
            isHead: true,
            prevNode: ''  // one more
        },{
            _id: 200,
            content: 'whatever2',
            nextNode: null,
            isHead: false,
            prevNode: 100  // one more
        }]);
    });

  });
});