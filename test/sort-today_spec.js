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
    it("should throw exception if no head found", function () {
        var input = [ { _id: '5871f0874b7165b5268d1eac',
            name: '123',
            note: '',
            user: '5871bd5a36968a96e281cbef',
            __v: 0,
            pomodoros: [],
            isHead: false,
            nextNode: '',
            prevNode: '',
            assigned: true,
            finished: false,
            updateTime: 'Sun Jan 08 2017 15:55:51 GMT+0800 (CST)',
            createTime: 'Sun Jan 08 2017 15:55:51 GMT+0800 (CST)',
            date: '2017-01-08' },
        { _id: '5871f0914b7165b5268d1eb0',
            name: 'b',
            note: '',
            user: '5871bd5a36968a96e281cbef',
            __v: 0,
            pomodoros: [ [Object] ],
            isHead: false,
            nextNode: '5871f0874b7165b5268d1eac',
            prevNode: '',
            assigned: true,
            finished: false,
            updateTime: 'Sun Jan 08 2017 15:56:01 GMT+0800 (CST)',
            createTime: 'Sun Jan 08 2017 15:56:01 GMT+0800 (CST)',
            date: '2017-01-08' } ]
        expect(sortToday.bind(null, input)).to.throw("head not exist");
     });
  });
});