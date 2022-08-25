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
    },
        { timestamps: true }
    )
module.exports = mongoose.model('withdraw', withdrawSchema)