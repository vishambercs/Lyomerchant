const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const Network = require('./network');
const Clients = require('./clients');
const clienthotwallets = new mongoose.Schema({
    address:
    {
        type        : String,
        required    : true,
        default     : "",
    },
    networkdetails: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Network,
		default : null,
	},
    clientdetail: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Clients,
		default : null,
	},
    api_key : 
    {
        type: String,
        required: true,
      
    },
    status : 
    {
        type: Number,
        required: true,
      
    },
    created_by : 
    {
        type: String,
        required: true,
      
    },
    updated_by : 
    {
        type: String,
        required: false,
        default: "",
    },
    
  
    

},
   
    { timestamps: true }
)
clienthotwallets.plugin(uniqueValidator);
module.exports = mongoose.model('clienthotwallets', clienthotwallets)














