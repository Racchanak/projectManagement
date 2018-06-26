/**
 * Admin.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        userName: { type: 'string', required: true, unique: true },
        email: { type: 'string', required: true, unique: true },
        password: { type: 'string', defaultsTo: '', protected: true },
        jwtToken: { type: 'string', defaultsTo: '' },
        type: { type: 'string', enum: ['admin', 'superadmin'], defaultsTo: 'admin' },
        responsibleTo: { model: 'Organization', defaultsTo: '' },
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
};