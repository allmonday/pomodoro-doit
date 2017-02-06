function getTags(nameString) {
    if (typeof nameString === 'string') {
        var tags = nameString.match(/#\S+?#/g) || [];
        return tags.map(item => item.replace(/#/g, ''));
    } else {
        throw Error("need string input");
    }
}

module.exports = getTags;