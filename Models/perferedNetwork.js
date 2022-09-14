const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const perferedNetwork = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    clientapikey:
    {
        type: String,
        required: true,
    },
    networkid: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    deleted_by: {
        type: String,
        required: true,
    },
    deleted_at: {
        type: String,
        required: true,
    },
},
    { timestamps: true }
)
perferedNetwork.plugin(uniqueValidator);
module.exports = mongoose.model('perferednetwork', perferedNetwork)