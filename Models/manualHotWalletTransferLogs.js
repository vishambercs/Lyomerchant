const mongoose = require('mongoose');
const validator = require('validator');
const manualHotWalletTransferLogs = new mongoose.Schema
    ({
        id: 
        {
            type: String,
            required: true,
            unique: true,
        },
        poolWalletID: 
        {
            type: String,
            required: false,
        },
        hotwalletID: 
        {
            type: String,
            required: false,
        },
      
        trans_hash: 
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
        created_by: 
        {
            type: String,
            required: false,
            default: 0,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('manualHotWalletTransferLogs', manualHotWalletTransferLogs)