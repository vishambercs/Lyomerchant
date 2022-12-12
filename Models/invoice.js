const mongoose      = require('mongoose');
const validator     = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const Clients       = require('./clients');
const invoiceSchema = new mongoose.Schema({
    id: 
    {
        type: String,
        required: true,
        unique: true,
    },
    invoiceNumber :
    {
        type: String,
        required: true,
    },
    clientdetails: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Clients,
		default : null,
	},
    merchantapikey :
    {
        type: String,
        required: true,
    },
    Items:
     [{
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
    payment_reason : 
    {
        type: String,
        required: false,
    },
    email: 
    {
        type: String,
        required: false,
    },
    mobileNumber:
    {
        type: String,
        required: false,
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
    itemlist: 
    {
        type: String,
        required: false,
    },
    callbackURL: 
    {
        type: String,
        required: false,
        default: null
    },
    errorURL: 
    {
        type: String,
        required: false,
        default: null
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
    tripId: {
        type     : String,
        required : false,
    },

    
},

{ timestamps: true }
)
invoiceSchema.plugin(uniqueValidator);
module.exports = mongoose.model('invoices', invoiceSchema)