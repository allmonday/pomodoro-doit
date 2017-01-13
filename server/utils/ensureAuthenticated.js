function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.send({error: "need logged in"})
    }
}

module.exports = ensureAuthenticated;