const mongoose = require('mongoose');
const validator = require('validator');


const payLinkSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    apiKey:
    {
        type: String,
        required: true,
    },
    merchantId:
    {
        type: String,
        required: true,
    },
    customerName : 
    {
        type: String,
        required: true,
    },
    invoiceNumber :
    {
        type: String,
        required: true,
    },
    email: 
    {
        type: String,
        required: true,
    },
    mobileNumber:
    {
        type: String,
        required: true,
    },
    duedate: 
    {
        type: String,
        
    },
    additionalNotes: 
    {
        type: String,
        
    },
    currency:
    {
        type: String,
        required: true,
    },
    totalAmount: 
    {
        type: Number,
        required: true,
    },   
    status: {
        type: String,
        required: true,
    },   
  },
    { timestamps: true }
)
module.exports = mongoose.model('paylinkPayment', payLinkSchema)