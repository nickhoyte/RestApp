var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID;

router.get('/:name', (req, res, next) => {
    const restaurants = req.app.locals.restaurants;
    const name = req.params.name;
    var edit = false;
    const date = new Date();
    var day = date.getDay();
    var openToday, opensAt, closesAt;

    restaurants.findOne({ name }, (err, results) => {
        if (err || !results) {
            res.render('restaurant-page', { messages: { error: ['Restaurant not found'] } });
        }

        if (results) {           
            if (req.isAuthenticated()) {
                const _id = ObjectID(req.session.passport.user);
                if (_id.equals(results.owner.user_id.equals) || _id.equals(results.creator.user_id)) {
                    edit = true;
                }
            }

            openToday = results.opening_hours[day].open

            if (openToday) {
                var openHr = (results.opening_hours[day].open_time / 60);
                var openMins = (results.opening_hours[day].open_time % 60);
                var closeHr = (results.opening_hours[day].close_time / 60);
                var closeMins = (results.opening_hours[day].close_time % 60);

                if (date.getHours() <= openHr && date.getMinutes() < openMins) {
                    //if (openHr > 12) openHr = openHr - 12;
                    if (openMins < 10) openMins = "0" + openMins;
                    opensAt = (openHr + ":" + openMins);
                }
                else if (date.getHours() >= openHr && date.getMinutes() > openMins) {
                    //if (closeHr > 12) closeHr = closeHr - 12;
                    if (closeMins < 10) closeMins = "0" + closeMins;
                    closesAt = (closeHr + ":" + closeMins);
                }
            }

            res.render('restaurant-page', { ...results, name, openToday, opensAt, closesAt, edit });
        }
    });
});

module.exports = router;