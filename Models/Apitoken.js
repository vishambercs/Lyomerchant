const mongoose  = require('mongoose');
const validator = require('validator');
const Apitoken  = new mongoose.Schema
    ({
        api_key: 
        {
            type: String,
            required: true,
            
        },
        token: 
        {
            type: String,
            required: true,
        },
        status: 
        {
            type: Number,
            required: false,
        },
        created_at:
        {
            type: String,
            required: false,
           
        },

    },
    { timestamps: true }
    )
module.exports = mongoose.model('Apitoken', Apitoken)