const mongoose = require('mongoose');
const validator = require('validator');
const PoolWallet = require('./poolWallet');
const Network = require('./network');
const Clients = require('./clients');
const Merchantstore = require('./merchantstore');
const posTransactionPoolSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    api_key:
    {
        type: String,
        required: true,
    }, 
    storedetails: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Merchantstore,
		default : null,
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
    poolwalletID:
    {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    deviceid: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default : 0
    },
    orderid: {
        type: String,
        required: true,
    },
    clientToken: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    callbackURL: {
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
    timestamps : 
    {
        type: String,
        required: true,
    },
  },
    { timestamps: true }
)
module.exports = mongoose.model('posTransactionPool', posTransactionPoolSchema)