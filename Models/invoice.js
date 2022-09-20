const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');

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
    merchantapikey :
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
        required: false,
        
    },
    additionalNotes: 
    {
        type: String,
        required: false,
        
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
        type: Number,
        required: true,
    },
    deleted_by: {
        type: String,
        required: false,
    },
    deleted_at: {
        type     : String,
        required : false,
    },
},

{ timestamps: true }
)
invoiceSchema.plugin(uniqueValidator);
module.exports = mongoose.model('invoices', invoiceSchema)