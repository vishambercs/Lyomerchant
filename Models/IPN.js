const mongoose  = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const IPNSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    client_api_key:
    {
        type: String,
        required: true,
    },
    client_api_token:
    {
        type: String,
        required: true,
    },
    ipn_url: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    created_at: {
        type: String,
        required: true,
    },
    updated_by: {
        type: String,
        required: false,
    },
    updated_at: {
        type: String,
        required: false,
    },
   
  },
    { timestamps: true }
)
IPNSchema.plugin(uniqueValidator);
module.exports = mongoose.model('ipn', IPNSchema)