const mongoose = require('mongoose');
const validator = require('validator');
const admin = require('./admin');
const topup = require('./topup');
const webHookCall = new mongoose.Schema({
    id: 
    {
        type: String,
        required: true,
        unique : true,
    },
    trans_id: 
    {
        type: String,
        required: true,
        
    },
    status: 
    {
        type: String,
        required: true,
    },
    response: 
    {
        type: String,
        required: false,
    },
    created_at: 
    {
        type: String,
        required: false,
    },
    manaual_update_cs: {
        type: String,
        required: false,
        default: false,
    },
    manaual_update_at_by_cs: {
        type: String,
        required: false,
        default: false,
    },
    manaual_update_by_admin: {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : admin,
		default : null,
    },
    topupdetails: {
        type    : mongoose.Schema.Types.ObjectId,
		ref     : topup,
		default : null,
    },
    manaual_update_at_by_admin: {
        type: String,
        required: false,
        default: false,
    } 
} ,

{ timestamps: true },

)



module.exports = mongoose.model('webHookCall', webHookCall)