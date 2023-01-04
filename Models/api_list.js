const mongoose          = require('mongoose');
const validator         = require('validator');
var uniqueValidator     = require('mongoose-unique-validator');
const api_list = new mongoose.Schema({
    api_path: 
    {
        type: String,
        required: true,
    },
    category: 
    {
        type: String,
        required: true,
    },
    name: 
    {
        type: String,
        required: false,
    },
    description: 
    {
        type: String,
        required: true,
    },
    status: 
    {
        type: Number,
        required: true,
    },
},
  
    { timestamps: true }
)
api_list.plugin(uniqueValidator);
module.exports = mongoose.model('api_list', api_list)