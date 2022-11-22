const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const topupschema = new mongoose.Schema({
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
    poolwalletID:
    {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    fiat_amount: {
        type: Number,
        required: false,
    },
    tx_hash: {
        type: String,
        required: false,
    },
    coin: {
        type: String,
        required: false,
    },
    orderid: {
        type: String,
        required: true,
        unique: true,
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
    extra_gas: {
        type: Number,
        required: false,
    },
    otp : 
    {
        type: String,
        required: false,
        default: "",
    }, 
    transhash : 
    {
        type: String,
        required: false,
        default: "",
    }, 
    updated_at : 
    {
        type: String,
        required: false,
        default: "",
    },
    crypto_paid : 
    {
        type: Number,
        required: false,
        default: 0,
    },
    transtype : 
    {
        type: Number,
        required: false,
        default: "",
    },
    is_check: {
        type: Boolean,
        default: true,
    },
    is_check_at: {
        type: String,
        required: false,
        default: false,
    },
    comes_at: {
        type: String,
        required: false,
        default: false,
    },
    expire_at: {
        type: String,
        required: false,
        default: false,
    },
    response_at: {
        type: String,
        required: false,
        default: false,
    },
},
   
    { timestamps: true }
)
topupschema.plugin(uniqueValidator);
module.exports = mongoose.model('topup', topupschema)














