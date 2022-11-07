const mongoose = require('mongoose');
const validator = require('validator');
const poolWalletSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
        unique:true,
    },
    network_id:
    {
        type: String,
        required: true,
    },
    balance:
    {
        type: String,
        required: true,
        default : 0
    },
    address:
    {
        type: String,
        required: true,
    },
    privateKey: {
        type: String,
        required: true,
    },
    previousbalance: {
        type: Number,
        required: false,
        default : 0,
    },
    queue: {
        type: Number,
        required: false,
        default : 0,
    },
    status: {
        type: Number,
        required: false,
        default: 0,
    },
    created_by: {
        type: String,
        required: false,
        default: 0,
    },
    remarks: {
        type: String,
        required: false,
        default: " ",
    },
},
    // {
    //     toJSON: {
    //         transform(doc, ret) {
    //             delete ret.privateKey;
    //             delete ret.__v;
    //         },
    //     },
    // },
    { timestamps: true }
)
module.exports = mongoose.model('poolWallet', poolWalletSchema)