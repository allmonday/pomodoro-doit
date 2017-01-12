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
    if (firstIndex === -1) {
        throw(new Error("head not exist"));
    }
    var firstItem = inputList[firstIndex];
    var hasnext = firstItem.nextNode;

    firstItem['prevNode']= "";
    var prevNode = firstItem._id;
    result.push(firstItem);


    while(!!hasnext) {
        var next = map[hasnext];
        if (next) {  // check next exist

            next['prevNode'] = prevNode;
            hasnext = map[hasnext].nextNode;  

            if (!map[hasnext]) {  // check next node exist, otherwise set nextNode null
                next['nextNode'] = null;
                hasnext = false
            }
            result.push(next);
            prevNode = next._id;

        } else {  // just break the while. end it
            hasnext = false;
        }
    }
    return result;
}

module.exports = sortLinkedList;
