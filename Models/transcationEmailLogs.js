const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const transcationEmailLogs = new mongoose.Schema({
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
        unique: true,
    },
    email_data:
    {
        type: String,
        required: true,
    },
    status:
    {
        type: Number,
        required: true,
    },
    created_at: 
    {
        type: String,
        required: true,
    },
},
    { timestamps: true }
)
transcationEmailLogs.plugin(uniqueValidator);
module.exports = mongoose.model('transcationEmailLogs', transcationEmailLogs)