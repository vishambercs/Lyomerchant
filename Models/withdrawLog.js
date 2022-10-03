const mongoose = require('mongoose');
const validator = require('validator');
const withdrawSchema = new mongoose.Schema
    ({
        id: 
        {
            type: String,
            required: true,
            unique: true,
        },
        api_key: 
        {
            type: String,
            required: true,
        },
        network_id: 
        {
            type: String,
            required: true,
        },
        amount: 
        {
            type: Number,
            required: true,
        },
        fee: 
        {
            type: String,
            required: true,
        },
        address_to:
        {
            type: String,
            required: true,
        },
        address_from:
        {
            type: String,
            required: false,
        },
        transcation_hash:
        {
            type: String,
            required: false,
        },
        status:
        {
            type: Number,
            required: true,
        },
        remarks:
        {
            type: String,
            required: false,
        },
        queue_type: 
        {
            type: Number,
            required: false,
            deafult: 0,
        },
        verified_type: 
        {
            type: String,
            required: false,
            deafult: 0,
        },
        external_id: 
        {
            type: String,
            required: false,
            deafult: 0,
        },
        timestamps: 
        {
            type: String,
            required: true,
            deafult: 0,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('withdraw', withdrawSchema)