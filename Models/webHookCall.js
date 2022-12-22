const mongoose = require('mongoose');
const validator = require('validator');
const webHookCall = new mongoose.Schema({
    id: 
    {
        type: String,
        required: true,
        unique : true,
    },
    trans_id: 
    {
        type: String,
        required: true,
        
    },
    status: 
    {
        type: String,
        required: true,
    },
    response: 
    {
        type: String,
        required: false,
    },
    created_at: 
    {
        type: String,
        required: false,
    },
} ,

{ timestamps: true },

)



module.exports = mongoose.model('webHookCall', webHookCall)