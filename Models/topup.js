const mongoose = require('mongoose');
const validator = require('validator');
const PoolWallet = require('./poolWallet');
const Network = require('./network');
const Clients = require('./clients');
var uniqueValidator = require('mongoose-unique-validator');
const topupschema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    pwid: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : PoolWallet,
		default : null,
	},
    nwid: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Network,
		default : null,
	},
    clientdetail: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Clients,
		default : null,
	},
    api_key:
    {
        type: String,
        required: true,
    },
    poolwalletID:
    {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    orderid: {
        type: String,
        required: true,
    },
    callbackURL: {
        type: String,
        required: true,
    },
    apiredirectURL: {
        type: String,
        required: true,
    },
    errorurl: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    walletValidity : 
    {
        type: String,
        required: true,
    },
    remarks : 
    {
        type: String,
        required: false,
    },
    canceled_at : 
    {
        type: String,
        required: false,
    },
    
    timestamps : 
    {
        type: String,
        required: true,
    },

},
   
    { timestamps: true }
)
topupschema.plugin(uniqueValidator);
module.exports = mongoose.model('topup', topupschema)