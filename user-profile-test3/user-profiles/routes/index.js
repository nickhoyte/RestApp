var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    const users = req.app.locals.users;
    const restaurants = req.app.locals.restaurants;

    users.find().limit(3).toArray((err, recentUsers) => {
        restaurants.find().limit(3).toArray((err, recentRestaurants) => {
            res.render('index', { recentUsers, recentRestaurants });
        });
    });
});

module.exports = router;
