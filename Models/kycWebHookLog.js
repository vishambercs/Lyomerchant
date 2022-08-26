const mongoose = require('mongoose');
const validator = require('validator');
const kycwebhooklog = new mongoose.Schema
    ({
        id:
        {
            type        : String,
            required    : true,
        },
        webhook_data:
        {
            type        : String,
            required    : true,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('kycwebhooklog', kycwebhooklog)