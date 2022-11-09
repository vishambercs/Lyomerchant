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