/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        userName: { type: 'string', required: true },
        email: { type: 'string', required: true, unique: true },
        organisation: { model: 'Organization' },
        jwtToken: { type: 'string', defaultsTo: '' },
        type: { type: 'string', enum: ['user', 'manager'], defaultsTo: 'user' },
        password: { type: 'string', defaultsTo: '', protected: true },
        active: { type: 'boolean', defaultsTo: true }
    },
    beforeCreate: function(values, next) {
        if (values.password) {
            var bcrypt = require('bcryptjs');
            bcrypt.genSalt(10, function(err, salt) {
                if (err) return next(err);
                bcrypt.hash(values.password, salt, function(err, hash) {
                    values.password = hash;
                    next();
                });
            });
        } else {
            next();
        }
    },
    beforeUpdate: function(values, next) {
        if (values.password) {
            var bcrypt = require('bcryptjs');
            bcrypt.genSalt(10, function(err, salt) {
                if (err) return next(err);
                bcrypt.hash(values.password, salt, function(err, hash) {
                    values.password = hash;
                    next();
                });
            });
        } else {
            next();
        }
    }
};