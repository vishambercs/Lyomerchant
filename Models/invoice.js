const mongoose = require('mongoose');
const validator = require('validator');


const invoiceSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    invoiceNumber :
    {
        type: String,
        required: true,
        unique: true,
    },
    merchantId :
    {
        type: String,
        required: true,
    },

    Items: [{
            number: {
                type: Number,
                
            },
            itemName: {
                type: String,
                
            },
            itemDesc: {
                type: String,
                
            },
            quantity: {
                type: Number,
               
            },
            rate: {
                type: Number,
                
            },
            amount: {
                type: Number,
                
            },
            tax: {
                type: Number,
                
            },      

        },
    ],
    customerName : 
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
module.exports = mongoose.model('invoices', invoiceSchema)