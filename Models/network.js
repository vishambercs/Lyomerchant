const mongoose = require('mongoose');
const validator = require('validator');
const networkSchema = new mongoose.Schema
    ({
        id: {
            type: String,
            required: true,
            unique: true,
        },
        libarayType: {
            type: String,
            enum : ['Web3','Tronweb','btcnetwork'],
            required: true,
        },
        network: {
            type: String,
            required: true,
        },
        currencyid: {
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
        nodeUrl: {
            type: String,
            required: true,
        },
        apiKey: {
            type: String,
            required: true,
        },
        transcationurl:{
            type: String,
            required: true,
        },
        scanurl: {
            type: String,
            required: true,
        },
        status: {
            type: Number,
            required: true,
            default: 0,
        },
        gaspriceurl: {
            type: String,
            required: true,
        },
        latest_block_number: {
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
        prefix: {
            type        : String,
            required    : false,
            default     : "",
        },
        icon: {
            type: String,
            required: false,
            default     : "",
        },
        gaslimit: {
            type        : String,
            required    : false,
            default     : "10000000000",
        },
        feedinglimit: {
            type        : String,
            required    : false,
            default     : "10000000",
        },
        feedinglimitPerce: {
            type        : Number,
            required    : false,
            default     : 0.1,
        },
        hotwallettranscationstatus: {
            type        : Boolean,
            required    : true,
            default     : true,
        },
        kyt_network_id  : {
            type        : String,
            required    : true,
        },
        withdrawflag  : {
            type        : Number,
            required    : false,
            default     : 3,
        },
        withdrawfee  : {
            type        : Number,
            required    : false,
            default     : 0,
        },
        fixedfee        : {
            type        : Number,
            required    : false,
            default     : 0,
        },
        native_currency_id  : {
            type            : String,
            required        : true,
        },
        
        created_by: {
            type: String,
            required: true,
        },
        updated_by: {
            type: String,
            required: false,
        },
        updated_at: {
            type: String,
            required: false,
        },
        deleted_by: {
            type: String,
            required: false,
            default : 0
        },
        deleted_at: {
            type: String,
            required: false,
        },
    },
        { timestamps: true }
    )
module.exports = mongoose.model('network', networkSchema)