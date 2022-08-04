const mongoose = require('mongoose');
const validator = require('validator');
const networkSchema = new mongoose.Schema
    ({
        id: {
            type: String,
            required: true,
            unique: true,
        },
        network: {
            type: String,
            required: true,
        },
        
        coin: {
            type: String,
            required: true,
        },
        cointype: {
            type: String,
            enum : ['Native','Token'],
            required: true,
         },
        contractAddress: {
            type: String,
            required: true,
        },
        contractABI: {
            type: String,
            required: true,
        },
        nodeUrl:{
            type: String,
            required: true,
        },
        apiKey:{
            type: String,
            required: true,
        },
        transcationurl:{
            type: String,
            required: true,
        },
        scanurl:{
            type: String,
            required: true,
        },
        gaspriceurl:{
            type: String,
            required: true,
        },
        latest_block_number:{
            type: String,
            required: true,
        },
        processingfee:{
            type: Number,
            required: true,
        },
        transferlimit:{
            type: Number,
            required: true,
        },
        created_by: {
            type: Number,
            required: true,
        },
        deleted_by: {
            type: Number,
            required: false,
        },
        deleted_at: {
            type: String,
            required: false,
        },
        
    },
        { timestamps: true }
    )
module.exports = mongoose.model('network', networkSchema)