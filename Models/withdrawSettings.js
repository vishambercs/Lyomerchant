const mongoose = require('mongoose');
const validator = require('validator');
const withdrawSettingsSchema = new mongoose.Schema
    ({
        id: 
        {
            type: String,
            required: true,
            unique: true,
        },
        
        pooltohotMode:  //automatic/limitbased
        {
            type: String,
            required: true,
        },
        pooltohotLimit:  
        {
            type: Number,
            required: true,
        },
        merchantWithdrawMode:  //percentage/limitbased
        {
            type: String,
            required: true,
        },
        merchantWithdrawLimit: 
        {
            type: Number,
            required: true,
        },
        merchantWithdrawFeePercentage: 
        {
            type: Number,
            required: true,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('withdrawSettings', withdrawSettingsSchema)