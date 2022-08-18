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
        required: true,
    },
    additionalNotes: 
    {
        type: String,
        required: true,
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
   
    orderId: {
        type: String,
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