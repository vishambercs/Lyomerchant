const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const kytlogsSchema = new mongoose.Schema({
    id :
    {
        type: String,
        required: true,
        unique: true,
    },
    withdraw_id :
    {
        type: String,
        required: true,
    },
    logs :
    {
        type: String,
        required: true,
    },
    type :
    {
        type: String,
        required: true,
        default : "withdrawal-attempts"
    },
  
},
{ timestamps: true }
)
kytlogsSchema.plugin(uniqueValidator);
module.exports = mongoose.model('kytlogs', kytlogsSchema)