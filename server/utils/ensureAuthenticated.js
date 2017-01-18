function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(400).send({error: "need logged in"})
    }
}

module.exports = ensureAuthenticated;