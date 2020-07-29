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

        res.redirect('/');
    });
});

router.get('/:username', (req, res, next) => {
    const users = req.app.locals.users;
    const username = req.params.username;
    var owner = false;

    users.findOne({ username }, (err, results) => {
        if (err || !results) {
            res.render('public-profile', { messages: { error: ['User not found'] } });
        }
        if (req.isAuthenticated()) {
            if (username == req.user.username) {
                owner = true;
            }
        }

        res.render('public-profile', { ...results, username, owner });
    });
});

router.post('/', (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/auth/login');
    }

    const users = req.app.locals.users;
    const { f_name, l_name, email} = req.body;
    const _id = ObjectID(req.session.passport.user);

    users.updateOne({ _id }, { $set: { f_name, l_name, email } }, (err) => {
        if (err) {
            throw err;
        }

        res.redirect('/users/' + req.user.username);
    });
});

module.exports = router;