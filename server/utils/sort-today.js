var _ = require("lodash");

function sortLinkedList(inputList) {

    var map = inputList.reduce(function (prev, item) {
        prev[item._id] = item;
        return prev;
    }, {});
    console.log(map);

    if (_.isEmpty(map)) {
        return [];
    }

    var result = [];
    var firstIndex = _.findIndex(inputList, {isHead: true});
    console.log(firstIndex);
    var firstItem = inputList[firstIndex];
    var hasnext = firstItem.nextNode;
    result.push(firstItem);

    while(!!hasnext) {
        result.push(map[hasnext]);
        hasnext = map[hasnext].nextNode;
    }
    return result;
}

module.exports = sortLinkedList;
