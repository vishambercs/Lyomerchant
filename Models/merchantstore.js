const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const merchantstoreSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true
    },
    clientapikey:
    {
        type: String,
        required: true,
    },
    storename:
    {
        type: String,
        required: true,
    },
    storeapikey:
    {
        type: String,
        required: true,
        unique:true
    },
    qrcode:
    {
        type: String,
        required: false,
       
    },
    storeprofile:
    {
        type: String,
        required: false,
       
    },
    status:
    {
        type: Number,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    deleted_by: {
        type: String,
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
merchantstoreSchema.plugin(uniqueValidator);
module.exports = mongoose.model('merchantstore', merchantstoreSchema)