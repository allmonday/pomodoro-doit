var _ = {
    isEmpty: (obj) => { 
        Object.keys(obj).length === 0 && obj.constructor === Object
    }
}

module.exports = _;