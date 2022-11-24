const mongoose      = require('mongoose');
const validator     = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const Clients       = require('./clients');
const invoice       = require('./invoice');
const paylinkPayment       = require('./payLink');
const admin       = require('./admin');
const paymentLinkTransactionPool       = require('./paymentLinkTransactionPool');

const InvoiceUpdateLogsSchema = new mongoose.Schema({
    invoicedetails :
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : invoice,
		default : null,
    },
    paylinkdetails :
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : paylinkPayment,
		default : null,
    },
    paymentlinktransactiondetails :
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : paymentLinkTransactionPool,
		default : null,
    },
   
    admindetails :
    {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : admin,
		default : null,
    },
   
    
   
},

{ timestamps: true }
)
InvoiceUpdateLogsSchema.plugin(uniqueValidator);
module.exports = mongoose.model('InvoiceUpdateLogsSchema', InvoiceUpdateLogsSchema)