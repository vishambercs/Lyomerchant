const mongoose  = require('mongoose');
const validator = require('validator');
const btchotwalletSchema = new mongoose.Schema
    ({
        id: 
        {
            type: String,
            required: true,
            unique: true,
        },
        transid: 
        {
            type: String,
            required: true,
        },
        pollwalletid: 
        {
            type: String,
            required: true,
        },
        networkid:
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
            type: String,
            required: false,
           
        },
        created_at:
        {
            type: String,
            required: false,
           
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
module.exports = mongoose.model('btchotwallettrans', btchotwalletSchema)