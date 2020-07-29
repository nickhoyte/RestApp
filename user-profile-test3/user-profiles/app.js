var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const MongoClient = require('mongodb').MongoClient;
const Mongoose = require('mongoose');
const Bcrypt = require('bcryptjs');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const hbs = require('hbs');
const SALT_WORK_FACTOR = 10;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountRouter = require('./routes/account');
var restaurantsRouter = require('./routes/restaurants');
const authRouter = require('./routes/auth');

var app = express();

//Connecting to DB and setting up DB variables
Mongoose.connect('mongodb+srv://nickhoyte:daleyjamal@natingtoeat-qmtcu.gcp.mongodb.net/restAppDB?retryWrites=true&w=majority');
const db = Mongoose.connection;
const users = db.collection('users');
const restaurants = db.collection('restaurants');
app.locals.users = users;
app.locals.restaurants = restaurants;

db.on('error', function (err) {
    console.log('connection error', err);
});

db.once('open', function () {
    console.log('Connection to DB successful!');
});

const UserSchema = new Mongoose.Schema({
    username: String,
    email: String,
    password: String,
    f_name: String,
    l_name: String
});

const RestaurantSchema = new Mongoose.Schema({
    rest_url: String,
    name: String,
    cuisine: String,
    address: {
        street: String,
        parish: String,
        zip: String
    },
    phone: String,
    website: String,
    deliver: Boolean,
    delivery_boundary: Boolean,
    delivery_boundary_length: Boolean,
    pick_up: Boolean,
    dine_in: Boolean,
    Opening_hours: [
        {
            open: Boolean,
            open_time: Number,
            close_time: Number
        },
        {
            open: Boolean,
            open_time: Number,
            close_time: Number
        },
        {
            open: Boolean,
            open_time: Number,
            close_time: Number
        },
        {
            open: Boolean,
            open_time: Number,
            close_time: Number
        },
        {
            open: Boolean,
            open_time: Number,
            close_time: Number
        },
        {
            open: Boolean,
            open_time: Number,
            close_time: Number
        },
        {
            open: Boolean,
            open_time: Number,
            close_time: Number
        }
    ],
    menus: [
        {
            menu_name: String,
            sub_menus: [
                {
                    sub_menu_name: String,
                    menu_items: [
                        {
                            item_name: String,
                            item_desc: String,
                            item_price: String
                        }
                    ]
                }
            ]
        }
    ],
    tags: [String],
    verified: Boolean,
    user: {
        user_id: String,
        username: String,
        status: String
    },
    avg_cost: Number,
    review_scores: {
        one_star: Number,
        two_star: Number,
        three_star: Number,
        four_star: Number,
        five_star: Number,
        num_reviews: Number,
        avg_score: Number
    },
    reviews: [
        {
            username: String,
            f_name: String,
            l_name: String,
            num_reviews: Number,
            review_score: Number,
            review_date: String,
            review_text: String,
            likes: Number
        }
    ],
    main_image: {
        thunbnail_url: String,
        medium_url: String,
        original_url: String,
        xl_url: String
    },
    user_images: [
        {
            image_url: String,
            username: String,
            image_desc: String
        }
    ]
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = Bcrypt.hashSync(this.password, SALT_WORK_FACTOR);
    next();
});

UserSchema.methods.comparePassword = function (plaintext, callback) {
    return callback(null, Bcrypt.compareSync(plaintext, this.password));
};

const UserModel = new Mongoose.model('user', UserSchema);
const RestaurantModel = new Mongoose.model('restaurant', RestaurantSchema);

passport.use(new Strategy(
    (username, password, done) => {
        UserModel.findOne({ username }, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (!(Bcrypt.compareSync(password, user.password))) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id)
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err, user);
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'session secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.loggedOut = !req.isAuthenticated();
    if (req.isAuthenticated()) {
        res.locals.curUser = req.user.username;
    }
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/account', accountRouter);
app.use('/restaurants', restaurantsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
