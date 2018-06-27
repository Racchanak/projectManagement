/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    userCreate: function(req, res) {
        var Joi = require('joi');
        var params = req.body;
        Joi.validate(req.body, {
            userName: Joi.string().required(),
            email: Joi.string().email().required(),
            organisation: Joi.string()
        }, function(error, value) {
            Users.findOne({ userName: params.userName }).exec(function(error, user) {
                if (error) {
                    sails.log.error(error);
                    return res.serverError('Database error');
                }
                if (user) {
                    return res.forbidden('User already exist');
                }
                var text = '';
                for (var i = 0; i < 4; i++)
                    text += (params.userName).charAt(Math.floor(Math.random() * (params.userName).length));
                params.password = randomValueHex(4) + text;
                var randomPassword = params.password;
                Users.create(params).exec(function(error, createUser) {
                    if (error) {
                        sails.log.error(error);
                        return res.serverError('Database error');
                    }
                    // var jwt = require('json-web-token');
                    // //create Token
                    // var payload = {
                    //     data: {
                    //         user: createUser.id,
                    //     }
                    // };
                    // jwt.encode(sails.config.jwtSecret, payload, function(error, jwtToken) {
                    //     if (error) {
                    //         return res.badRequest('We had trouble authenticating you. Please try again later.');
                    //     }
                    //     Users.update({ id: user.id }, { jwtToken: jwtToken }).exec(function(error, token) {
                    //         if (error) {
                    //             sails.log.error(error);
                    //             return res.serverError('Database error');
                    //         }
                    //     });
                    // });
                    createUser.cpassword = randomPassword;
                    return res.ok({
                        user: createUser
                    });
                });
            });
        });
    },

    userLogIn: function(req, res) {
        var Joi = require('joi');
        Joi.validate(req.body, {
            email: Joi.string().email().required(),
            password: Joi.string().required()
        }, function(error, value) {
            if (error) {
                return res.badRequest(error.details);
            }
            req.body.email = req.body.email.toLowerCase();
            Users.findOne({ email: req.body.email }).exec(function(error, user) {
                if (error) {
                    throw Error(error);
                }
                if (!user) {
                    return res.notFound('The user does not exist.');
                }
                if (!user.active) {
                    return res.forbidden('You cannot log in as your account has been deactivated. Contact your administrator to reactivate your account.');
                }
                var bcrypt = require('bcryptjs');
                bcrypt.compare(req.body.password, user.password, function(error, isCorrectPassword) {
                    if (isCorrectPassword) {
                        return res.ok({
                            user: user
                        });
                    } else {
                        return res.forbidden('The password did not match. Try again.');
                    }
                });

            });
        });
    },

    userUpdate: function(req, res) {
        var params = req.body;
        var Joi = require('joi');
        Joi.validate(req.body, {
            userName: Joi.string()
        }, function(error, value) {
            if (error) {
                return res.badRequest(error.details);
            }
            Users.findOne({ id: req.param('userId') }).exec(function(error, existingUser) {
                if (error) {
                    sails.log.error(error);
                    return res.serverError('Database error');
                }
                if (!existingUser) {
                    return res.notFound('Cannot update the details that does not exist.');
                }
                Users.update({ id: req.param('userId') }, params).exec(function(error, updateUser) {
                    if (error) {
                        sails.log.error(error);
                        return res.serverError('Database error');
                    }
                    return res.ok(updateUser);
                });
            });

        });
    }
};

function randomValueHex(len) {
    var crypto = require('crypto');
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len); // return required number of characters
}