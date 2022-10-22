const mongoose = require('mongoose');
const validator = require('validator');
const orphanwalletlogs = new mongoose.Schema
    ({
        id: 
        {
            type: String,
            required: true,
            unique: true,
        },
        trans_id: 
        {
            type: String,
            required: true,
        },
        remarks: 
        {
            type: String,
            required: true,
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
      
    },
        
    )
module.exports = mongoose.model('orphanwalletlog', orphanwalletlogs)