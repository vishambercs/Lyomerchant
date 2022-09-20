const mongoose = require('mongoose');
const validator = require('validator');
const HotTransLogs = new mongoose.Schema({
    id: 
    {
        type: String,
        required: true,
       
    },
    feeding_trans_id: 
    {
        type: String,
        required: true,
    },
    trans_id: 
    {
        type: String,
        required: true,
    },
    type: 
    {
        type: String,
        required: true,
    },
    verified_by: 
    {
        type: String,
        required: false,
    },
    verified_at: 
    {
        type: String,
        required: false,
    },
    created_by: 
    {
        type: String,
        required: true,
    },
    created_at: 
    {
        type: String,
        required: true,
    },
   
} ,

{ timestamps: true },

)



module.exports = mongoose.model('HotTransLogs', HotTransLogs)