const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const Topup = require('./topup');
const admin = require('./admin');
const Topuptranshash = new mongoose.Schema({
    transhash:
    {
        type: String,
        required: true,
    },
    amount:
    {
        type: Number,
        required: true,
    },
    topupdetails: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Topup,
		default : null,
	},
    updated_at: 
    {
	    type: String,
        required: false,
        default : false,
    
	},
    status: 
    {
        type        : Number,
        required    : false,
        default     : 1,
    
	},
    manaual_by_admin: {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : admin,
		default : null,
    },
    manaual_update_at_by_admin: {
        type: String,
        required: false,
        default: false,
    },
},
   
    { timestamps: true }
)
Topuptranshash.plugin(uniqueValidator);
module.exports = mongoose.model('Topuptranshash', Topuptranshash)














