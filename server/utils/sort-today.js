var _ = require("lodash");

function sortLinkedList(inputList) {

    console.log(inputList)
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
        try {  // if nextNode not existed.. (eg: forget to remove);
            var next = map[hasnext];
            console.log(next);
            next['prevNode'] = prevNode;
            result.push(next);
            prevNode = next._id;
            hasnext = map[hasnext].nextNode;
        } catch(e) {
            hasnext = false;
        }

    }
    return result;
}

module.exports = sortLinkedList;
