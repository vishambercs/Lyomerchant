const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');

const impersonatelog = new mongoose.Schema({
    id: 
    {
        type: String,
        required: true,
        unique: true,
    },
    customerapi: 
    {
        type: String,
        required: true,
        
    },
    adminapi :
    {
        type: String,
        required: true,
    },
    createdat :
    {
        type: String,
        required: true,
    },
   
    
},

{ timestamps: true }
)
impersonatelog.plugin(uniqueValidator);
module.exports = mongoose.model('impersonatelog', impersonatelog)