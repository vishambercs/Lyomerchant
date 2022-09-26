const mongoose = require('mongoose');
const validator = require('validator');


const payLinkSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    invoice_id:
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
module.exports = mongoose.model('paylinkPayment', payLinkSchema)