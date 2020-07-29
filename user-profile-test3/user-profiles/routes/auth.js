const express = require('express');
const router = express.Router();
const Bcrypt = require('bcryptjs');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const SALT_WORK_FACTOR = 10;

router.get('/login', (req, res, next) => {
    const messages = req.flash();
    res.render('login', { messages });
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/auth/login', failureFlash: 'Incorrect username or password' }), (req, res, next) => {
    res.redirect('/users');
});

router.get('/register', (req, res, next) => {
    const messages = req.flash();
    res.render('register', { messages });
});

router.post('/register', (req, res, next) => {
    const registrationParams = req.body;
    const users = req.app.locals.users;
    const payload = {
        username: registrationParams.username,
        email: registrationParams.email,
        password: Bcrypt.hashSync(registrationParams.password, SALT_WORK_FACTOR),
        f_name: registrationParams.f_name,
        l_name: registrationParams.l_name
    };
    
    users.insertOne(payload, (err) => {
        if (err) {
            req.flash('error', 'User account already exists');
        }
        else {
            req.flash('success', 'User account was registered successfully');
        }

        res.redirect('/auth/register');
    });
});

router.get('/register-restaurant', (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Login required to create a restaurant');
        res.redirect('login');
    }
    else {
        const messages = req.flash()

        res.render('register-restaurant', { messages });
    }
});

router.post('/register-restaurant', (req, res, next) => {
    const registrationParams = req.body;
    const users = req.app.locals.users;
    const restaurant = req.app.locals.restaurants;
    const _id = ObjectID(req.session.passport.user);

    const payload = {
        name: registrationParams.name,
        cuisine: registrationParams.cuisine,
        address: {
            street: registrationParams.street,
            parish: registrationParams.parish,
            zip: registrationParams.zip
        },
        phone: registrationParams.phone,
        website: registrationParams.website,
        deliver: registrationParams.deliver,
        deliver_boundary: registrationParams.deliver_boundary,
        deliver_boundary_length: registrationParams.delivery_boundary_length,
        pick_up: registrationParams.pick_up,
        dine_in: registrationParams.dine_in,
        opening_hours: [
            {
                open: registrationParams.open_sun,
                open_time: registrationParams.open_time_sun,
                close_time: registrationParams.close_time_sun
            },
            {
                open: registrationParams.open_mon,
                open_time: registrationParams.open_time_mon,
                close_time: registrationParams.close_time_mon
            },
            {
                open: registrationParams.open_tue,
                open_time: registrationParams.open_time_tue,
                close_time: registrationParams.close_time_tue
            },
            {
                open: registrationParams.open_wed,
                open_time: registrationParams.open_time_wed,
                close_time: registrationParams.close_time_wed
            },
            {
                open: registrationParams.open_thu,
                open_time: registrationParams.open_time_thu,
                close_time: registrationParams.close_time_thu
            },
            {
                open: registrationParams.open_fri,
                open_time: registrationParams.open_time_fri,
                close_time: registrationParams.close_time_fri
            },
            {
                open: registrationParams.open_sat,
                open_time: registrationParams.open_time_sat,
                close_time: registrationParams.close_time_sat
            }
        ],
        creator: {
            user_id: _id,
            username: req.user.username
        },
        owner: {
            user_id: "",
            username: ""
        }
    }

    restaurant.insertOne(payload, (err) => {
        if (err) {
            req.flash('error', 'Restaurant already exists');
            res.redirect('/auth/register-restaurant');
        }
        else {
            req.flash('success', 'Restaurant was registered successfully');
            res.redirect('/restaurants/' + registrationParams.name);
        }    
    });
});

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;



