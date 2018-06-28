/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    adminCreate: function(req, res) {
        var Joi = require('joi');
        var params = req.body;
        Joi.validate(req.body, {
            userName: Joi.string().required(),
            email: Joi.string().email().required(),
            responsibleTo: Joi.string(),
            type: Joi.string()
        }, function(error, value) {
            Admin.findOne({ userName: params.userName }).exec(function(error, admin) {
                if (error) {
                    sails.log.error(error);
                    return res.serverError('Database error');
                }
                if (admin) {
                    return res.forbidden('Admin already exist');
                }
                var text = '';
                for (var i = 0; i < 4; i++)
                    text += (params.userName).charAt(Math.floor(Math.random() * (params.userName).length));
                params.password = randomValueHex(4) + text;
                var randomPassword = params.password;
                Admin.create(params).exec(function(error, createAdmin) {
                    if (error) {
                        sails.log.error(error);
                        return res.serverError('Database error');
                    }
                    // var jwt = require('json-web-token');
                    // //create Token
                    // var payload = {
                    //     data: {
                    //         admin: admin.id,
                    //     }
                    // };
                    // jwt.encode(sails.config.jwtSecret, payload, function(error, jwtToken) {
                    //     if (error) {
                    //         return res.badRequest('We had trouble authenticating you. Please try again later.');
                    //     }
                    //     Admin.update({ id: admin.id }, { jwt: jwtToken }).exec(function(error, token) {
                    //         if (error) {
                    //             sails.log.error(error);
                    //             return res.serverError('Database error');
                    //         }
                    //     });
                    // });
                    createAdmin.cpassword = randomPassword;
                    return res.ok({
                        admin: createAdmin
                    });
                });
            });
        });
    },

    adminLogIn: function(req, res) {
        var Joi = require('joi');
        Joi.validate(req.body, {
            email: Joi.string().email().required(),
            password: Joi.string().required()
        }, function(error, value) {
            if (error) {
                return res.badRequest(error.details);
            }
            req.body.email = req.body.email.toLowerCase();
            Admin.findOne({ email: req.body.email }).populateAll().exec(function(error, admin) {
                if (error) {
                    throw Error(error);
                }
                if (!admin) {
                    return res.notFound('The admin does not exist.');
                }
                if (!admin.active) {
                    return res.forbidden('You cannot log in as your account has been deactivated. Contact your administrator to reactivate your account.');
                }
                var bcrypt = require('bcryptjs');
                bcrypt.compare(req.body.password, admin.password, function(error, isCorrectPassword) {
                    if (isCorrectPassword) {
                        return res.ok({
                            admin: admin
                        });
                    } else {
                        return res.forbidden('The password did not match. Try again.');
                    }
                });

            });
        });
    },

    adminUpdate: function(req, res) {
        var params = req.body;
        var Joi = require('joi');
        Joi.validate(req.body, {
            userName: Joi.string(),
            email: Joi.string(),
            active: Joi.boolean()
        }, function(error, value) {
            if (error) {
                return res.badRequest(error.details);
            }
            Admin.findOne({ id: req.param('adminId') }).exec(function(error, existingAdmin) {
                if (error) {
                    sails.log.error(error);
                    return res.serverError('Database error');
                }
                if (!existingAdmin) {
                    return res.notFound('Cannot update the details that does not exist.');
                }
                Admin.update({ id: req.param('adminId') }, params).exec(function(error, updateadmin) {
                    if (error) {
                        sails.log.error(error);
                        return res.serverError('Database error');
                    }
                    return res.ok(updateadmin);
                });
            });

        });
    },

    organizationCreate: function(req, res) {
        var Joi = require('joi');
        var params = req.body;
        Joi.validate(req.body, {
            name: Joi.string().required(),
            belongsTo: Joi.string().email().required()
        }, function(error, value) {
            Organization.findOne({ name: params.name }).exec(function(error, organization) {
                if (error) {
                    sails.log.error(error);
                    return res.serverError('Database error');
                }
                if (organization) {
                    return res.forbidden('Organization already exist');
                }
                Organization.create(params).exec(function(error, createOrganization) {
                    if (error) {
                        sails.log.error(error);
                        return res.serverError('Database error');
                    }
                    return res.ok({
                        organization: createOrganization
                    });
                });
            });
        });
    },

    userUpdate: function(req, res) {
        var params = req.body;
        var Joi = require('joi');
        Joi.validate(req.body, {
            userName: Joi.string(),
            email: Joi.string(),
            type: Joi.string(),
            active: Joi.boolean()
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
    },

    projectCreate: function(req, res) {
        var Joi = require('joi');
        var params = req.body;
        Joi.validate(req.body, {
            projectName: Joi.string().required(),
            linkedTo: Joi.string().required(),
            belongsTo: Joi.string().required()
        }, function(error, value) {
            Projects.findOne({ projectName: params.projectName }).exec(function(error, project) {
                if (error) {
                    sails.log.error(error);
                    return res.serverError('Database error');
                }
                if (project) {
                    return res.forbidden('Project already exist');
                }
                Projects.create(params).exec(function(error, createProject) {
                    if (error) {
                        sails.log.error(error);
                        return res.serverError('Database error');
                    }
                    return res.ok({
                        project: createProject
                    });
                });
            });
        });
    },

    superAdminAccessList: function(req, res) {
        var params = req.query;
        var collection = params.collection;
        if (collection == "admin") {
            var getCollection = Admin;
            var $select = '{"type": "admin"}';
            var select = JSON.parse($select);
        }
        if (collection == "organization") {
            var getCollection = Organization;
            var select = {};
        }
        getCollection.find(select).sort('createdAt DESC').exec(function(error, details) {
            if (error) {
                sails.log.error(error);
                return res.serverError("Database error");
            }
            return res.ok({
                [collection]: details
            });
        });
    },

    adminAccessList: function(req, res) {
        var params = req.query;
        var collection = params.collection;
        if (params.collection == "users") {
            var getCollection = Users;
            var $select = '{"type": "user"}';
            var select = JSON.parse($select);
        }
        if (params.collection == "managers") {
            var getCollection = Users;
            var $select = '{"type": "manager"}';
            var select = JSON.parse($select);
        }
        if (params.collection == "projects") {
            var getCollection = Projects;
            var select = {};
        }
        getCollection.find(select).sort('createdAt DESC').exec(function(error, details) {
            if (error) {
                sails.log.error(error);
                return res.serverError("Database error");
            }
            return res.ok({
                [collection]: details
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