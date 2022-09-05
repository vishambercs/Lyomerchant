const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const merchantsites = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true
    },
    merchantapikey:
    {
        type: String,
        required: true,
    },
    siteapikey:
    {
        type: String,
        required: true,
        unique:true
    },
    domain:
    {
        type: String,
        required: true,
    },
    status:
    {
        type: Number,
        required: true,
    },
    created_by: {
        type: Number,
        required: true,
    },
    deleted_by: {
        type: Number,
        required: false,
        default: 0
    },
    deleted_at: {
        type: String,
        required: false,
    },

},
    { timestamps: true }
)
merchantsites.plugin(uniqueValidator);
module.exports = mongoose.model('merchantsites', merchantsites)