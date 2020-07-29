var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;

router.get('/', (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/auth/login');
    }

    const users = req.app.locals.users;
    const _id = ObjectID(req.session.passport.user);

    users.findOne({ _id }, (err, results) => {
        if (err) {
            throw err;
        }

        res.render('account', { ...results });
    });
});

module.exports = router;