const mongoose = require('mongoose');
const validator = require('validator');
const hotwallettranslogs = new mongoose.Schema
    ({
        id: 
        {
            type: String,
            required: true,
            unique: true,
        },
        merchant_trans_id: 
        {
            type: String,
            required: true,
        },
        hot_wallet_id: 
        {
            type: String,
            required: false,
            default: 0,
        },
        trans_id: 
        {
            type: String,
            required: true,
        },
        network_id:
        {
            type: String,
            required: true,
        },
        status:
        {
            type: String,
            required: true,
        },
        remarks:
        {
            type: String,
            required: true,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('hotwallettranslogs', hotwallettranslogs)