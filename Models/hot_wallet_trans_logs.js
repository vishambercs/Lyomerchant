// const mongoose = require('mongoose');
// const validator = require('validator');
// const hotwallettranslogs = new mongoose.Schema
//     ({
//         id: 
//         {
//             type: String,
//             required: true,
//             unique: true,
//         },
//         merchanttransid: 
//         {
//             type: String,
//             required: true,
//         },
//         balance: 
//         {
//             type: Number,
//             required: false,
//             default: 0,
//         },
//         network_id: 
//         {
//             type: String,
//             required: true,
//         },
//         address:
//         {
//             type: String,
//             required: true,
//         },
//         privatekey:
//         {
//             type: String,
//             required: true,
           
//         },
//         status:
//         {
//             type: Number,
//             required: true,
           
//         }
//     },
//     {
//         toJSON: {
//             transform(doc, ret) {
//                 delete ret.privateKey;
//                 delete ret.__v;
//             },
//         },
//     },
//         { timestamps: true }
//     )
// module.exports = mongoose.model('hotwallettranslogs', hotwallettranslogs)