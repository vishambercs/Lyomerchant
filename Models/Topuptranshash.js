const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const Topup = require('./topup');
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

},
   
    { timestamps: true }
)
Topuptranshash.plugin(uniqueValidator);
module.exports = mongoose.model('Topuptranshash', Topuptranshash)














