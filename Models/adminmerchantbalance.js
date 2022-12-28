const mongoose          = require('mongoose');
const validator         = require('validator');
var uniqueValidator     = require('mongoose-unique-validator');
const clients           = require('./clients');
const network           = require('./network');
const admin             = require('./admin');
const adminmerchantbalanceSchema = new mongoose.Schema({
    cliendetails:
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : clients,
		default : null,
    },
    client_api_key:
    {
        type: String,
        required: true,
    },
    networkdetails: 
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : network,
		default : null,
    },
    amount: 
    {
        type: Number,
        required: true,
    },
    status: 
    {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['credit', 'deposit'],
        required: true,
    },
    admindetails: 
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : admin,
		default : null,
    },
},
    { timestamps: true }
)
adminmerchantbalanceSchema.plugin(uniqueValidator);
module.exports = mongoose.model('adminmerchantbalance', adminmerchantbalanceSchema)