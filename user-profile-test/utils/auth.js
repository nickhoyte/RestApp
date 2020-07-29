const bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var express = require('express');

const hashPassword = (plainText) =>
{
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(plainText, salt, function (err, hash) {
            if (err) return next(err);

            return hash;
        });
    });
}