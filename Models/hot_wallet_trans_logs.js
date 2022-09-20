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
        feeding_wallet_id: 
        {
            type: String,
            required: false,
        },
        feeding_trans_id: 
        {
            type: String,
            required: false,
        },
        pool_wallet_id: 
        {
            type: String,
            required: false,
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
            required: false,
        },
        network_id:
        {
            type: String,
            required: false,
        },
        feelimit:
        {
            type: Number,
            required: false,
        },
        verified_by: 
        {
            type: String,
            required: false,
        },
        verified_at: 
        {
            type: String,
            required: false,
        },
        status:
        {
            type: String,
            required: false,
        },
        remarks:
        {
            type: String,
            required: false,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('hotwallettranslogs', hotwallettranslogs)