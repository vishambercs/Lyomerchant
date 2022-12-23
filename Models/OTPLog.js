const mongoose  = require('mongoose');
const validator = require('validator');
const topup     = require('./topup');
const OTPLog = new mongoose.Schema({
    otp:
    {
        type: String,
        required: true,
    },
    topup_details:
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : topup,
		default : null,
    },
    created_at: 
    {
        type: String,
        required: false,
    }, 
  },
    { timestamps: true }
)
module.exports = mongoose.model('OTPLog', OTPLog)