var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/*//Youtube
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const Strategy = require('passport-local').Startegy;
const session = require('express-session');
const flash = require('connect-flash');
*/

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//bcrypt example
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;


var app = express();

//bcrypt example
mongoose.connect('mongodb+srv://nickhoyte:daleyjamal@natingtoeat-qmtcu.gcp.mongodb.net/restAppDB?retryWrites=true&w=majority');

var db = mongoose.connection;


db.on('error', function (err) {
    console.log('connection error', err);
});

db.once('open', function () {
    console.log('Connection to DB successful');
});

var Schema = mongoose.Schema;
var mySchema = new Schema({
    username: String,
    email: String,
    password: String,
    f_name: String,
    l_name: String
});

var hashPassword = function (plainTextPassword, cb) {
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return cb(err);

        bcrypt.hash(plainTextPassword, salt, function (err, hash) {
            if (err) return cb(err);

            return cb(null, hash);
        });
    });
};

mySchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            console.log('hash');
            next();
        });
    });
});

var User = mongoose.model('User', mySchema);

var testData = new User({
    username: "admin",
    email: "test@test.com",
    password: "test123",
    f_name: "John",
    l_name: "Doe"
});

testData.save(function (err, data) {
    if (err) console.log(error);
    else console.log('Success: ', data);
});


//Youtube
MongoClient.connect('mongodb+srv://nickhoyte:daleyjamal@natingtoeat-qmtcu.gcp.mongodb.net/restAppDB?retryWrites=true&w=majority', (err, client) => {
    if (err) {
        throw err;
    }

    const db = client.db('restAppDB');
    const users = db.collection('useers');
    app.local.users = users;
});

passport.use(new Strategy(
    (username, password, done) => {
        app.local.users.findOne({ username }, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (user.password != password) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
