const mongoose = require('mongoose');
const validator = require('validator');

const quickpaymentmodelSchema = new mongoose.Schema({
    id:
    {
        type        : String,
        required    : true,
        unique      : true,
    },
    api_key:
    {
        type        : String,
        required    : true,
    },
    type:
    {
        type: String,
        enum : ['Deposit','Coins'],
        required: true,

    },
    code:
    {
        type: String,
        required: true,
    },
    poolwalletID:
    {
        type: String,
        required: false,
    },
    qty: {
        type: Number,
        required: false,
    },
    totalamount: 
    {
        type: String,
        required: false,
    },
    status: {
        type: Number,
        required: true,
    },
    timestamps : 
    {
        type: String,
        required: true,
    },
    created_at : 
    {
        type: String,
        required: true,
    },

  },
    { timestamps: true }
)
module.exports = mongoose.model('quickpaymentmodel', quickpaymentmodelSchema)