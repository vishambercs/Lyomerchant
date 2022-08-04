const mongoose = require('mongoose');
const validator = require('validator');



const transcationLog = new mongoose.Schema({
    trans_pool_id: 
    {
        type: String,
        required: false,
        default: "",
    },
    blockNumber: 
    {
        type: String,
        required: false,
    },
    timeStamp: 
    {
        type: String,
        required: false,
    },
    hash: 
    {
        type: String,
        required: false,
    },
    nonce: 
    {
        type: String,
        required: false,
    },
    blockHash: 
    {
        type: String,
        required: false,
    },
    transactionIndex: 
    {
        type: String,
        required: false,
    },
    from: 
    {
        type: String,
        required: false,
    },
    to: 
    {
        type: String,
        required: false,
    },
    value: 
    {
        type: String,
        required: false,
    },
    amount: 
    {
        type: Number,
        required: false,
    },
    scanurl: 
    {
        type: String,
        required: false,
    },
    gasPrice: 
    {
        type: String,
        required: false,
    },
    isError: 
    {
        type: String,
        required: false,
    },
    txreceipt_status: 
    {
        type: String,
        required: false,
    },
    input: 
    {
        type: String,
        required: false,
    },
    contractAddress: 
    {
        type: String,
        required: false,
    },
    cumulativeGasUsed: 
    {
        type: String,
        required: false,
    },
    gasUsed: 
    {
        type: String,
        required: false,
    },
    confirmations: 
    {
        type: String,
        required: false,
    },
} ,

{ timestamps: true },

)



module.exports = mongoose.model('transcationLog', transcationLog)