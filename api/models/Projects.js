/**
 * Projects.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        projectName: { type: 'string', required: true },
        linkedTo: { model: 'Admin' },
        belongsTo: { model: 'Users' },
        participants: { type: 'array', defaultsTo: [] },
        active: { type: 'boolean', defaultsTo: true }
    }
};