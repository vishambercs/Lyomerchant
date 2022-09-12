const mongoose = require('mongoose');
const validator = require('validator');
const currencySchema = new mongoose.Schema
    ({
        id:
        {
            type: String,
            required: true,
            unique: true,
        },
        title:
        {
            type: String,
            required: true,
        },
        name:
        {
            type: String,
            required: true,
        },
        icon:
        {
            type: String,
            required: true,
        },
        status:
        {
            type: Number,
            required: true,
        },

        remarks:
        {
            type: String,
            required: false,

        },
        created_by:
        {
            type: String,
            required: true,
           
        },
        deleted_by: {
            type: String,
            required: false,
            default: 0,
        },
        deleted_at: {
            type: String,
            required: false,
            default: 0,
        },
       
      },
        { timestamps: true }
    )
module.exports = mongoose.model('currency', currencySchema)