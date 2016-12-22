var _ = require("lodash");

function sortLinkedList(inputList) {

    var map = inputList.reduce(function (prev, item) {
        prev[item._id] = item;
        return prev;
    }, {});

    if (_.isEmpty(map)) {
        return [];
    }

    var result = [];
    var firstIndex = _.findIndex(inputList, {isHead: true});
    var firstItem = inputList[firstIndex];
    var hasnext = firstItem.nextNode;

    firstItem['prevNode']= "";
    var prevNode = firstItem._id;
    result.push(firstItem);


    while(!!hasnext) {
        var next = map[hasnext];
        next['prevNode'] = prevNode;
        result.push(next);
        prevNode = next._id;
        hasnext = map[hasnext].nextNode;
    }
    return result;
}

module.exports = sortLinkedList;
