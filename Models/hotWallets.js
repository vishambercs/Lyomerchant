const mongoose = require('mongoose');
const validator = require('validator');
const hotwalletsSchema = new mongoose.Schema
    ({
        id: 
        {
            type: String,
            required: true,
            unique: true,
        },
        network_id: 
        {
            type: String,
            required: true,
        },
        address: 
        {
            type: String,
            required: true,
        },
        privateKey:
        {
            type: String,
            required: true,
        },
        status:
        {
            type: Number,
            required: true,
           
        },
        created_by:
        {
            type: Number,
            required: true,
           
        },
        deleted_by:
        {
            type: Number,
            required: false,
            default : 0
        },
        deleted_at:
        {
            type: String,
            required: false,
            default : ""
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.privateKey;
                delete ret.__v;
            },
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('hotwallets', hotwalletsSchema)