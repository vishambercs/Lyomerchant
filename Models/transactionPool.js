const mongoose = require('mongoose');
const validator = require('validator');
const mongoosePaginate = require("mongoose-paginate-v2");
const PoolWallet = require('./poolWallet');
const Network = require('./network');
const Clients = require('./clients');
const transactionPoolSchema = new mongoose.Schema({
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
    timestamps : 
    {
        type: String,
        required: true,
    },
  },
    { timestamps: true }
)
transactionPoolSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('transactionPool', transactionPoolSchema)