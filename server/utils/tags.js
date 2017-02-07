function getTags(nameString) {
    if (typeof nameString === 'string') {
        // var tags = nameString.match(/#\w+?#/g) || [];
        var tags = nameString.match(/#.*?#/g) || [];
        return tags.map(item => item.replace(/#/g, '').trim());
    } else {
        throw Error("need string input");
    }
}

module.exports = getTags;