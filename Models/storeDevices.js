const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const storeDevices = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    storekey:
    {
        type: String,
        required: true,
    },
    devicetoken:
    {
        type: String,
        required: true,
    },
    otptoken:
    {
        type: String,
        required: true,
    },
    status:
    {
        type: Number,
        enum : [0,1,2],
        required: true,
    },
    deviceid:
    {
        type: String,
        required: true,
        unique:true,
    },
    devicedata:
    {
        type: String,
        required: true,
    },
    deleted_by:
    {
        type: String,
        required: false,
        default : 0
    },
    deleted_at:
    {
        type: String,
        required: false,
    },
    updated_by:
    {
        type: String,
        required: false,
        default : 0
    },
    updated_at:
    {
        type: String,
        required: false,
    },
},
{ timestamps: true }
)
storeDevices.plugin(uniqueValidator);
module.exports = mongoose.model('storeDevices', storeDevices)