const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const merchantcategorySchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true
    },
    categoryid:
    {
        type: String,
        required: true,
    },
    clientapikey:
    {
        type: String,
        required: true,
    },
    status:
    {
        type: Number,
        required: true,
    },
    remarks: {
        type: String,
        required: false,
    },
    updated_by: {
        type: String,
        
        required: false,
    },
    created_by: {
        type: String,
        required: true,
    },
    deleted_by: {
        type: String,
        required: false,
        default: 0
    },
    deleted_at: {
        type: String,
        required: false,
    },

},
    { timestamps: true }
)
merchantcategorySchema.plugin(uniqueValidator);
module.exports = mongoose.model('merchantcategory', merchantcategorySchema)