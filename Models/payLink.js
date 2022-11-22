const mongoose  = require('mongoose');
const validator = require('validator');
const Invoice   = require('./invoice');

const payLinkSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    invoicedetails:
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : Invoice,
		default : null,
    },
    invoice_id:
    {
        type: String,
        required: true,
    },
    status: 
    {
        type: Number,
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
module.exports = mongoose.model('paylinkPayment', payLinkSchema)