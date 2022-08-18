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
    status: {
        type: Boolean,
        required: true,
    },
},

{ timestamps: true }
)
module.exports = mongoose.model('invoices', invoiceSchema)