const mongoose = require('mongoose');
const validator = require('validator');
const kycWebHook = new mongoose.Schema
    ({
        id:
        {
            type        : String,
            required    : true,
            unique      : true,
        },
        kyc_url_webhook:
        {
            type        : String,
            required    : true,
        },
        status:
        {
            type        : Number,
            required    : true,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('kycWebHook', kycWebHook)