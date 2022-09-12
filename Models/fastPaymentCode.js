const mongoose = require('mongoose');
const validator = require('validator');


const fastCodeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
     merchantId :
    {
        type: String,
        required: true,
    },
    fastCodes:[{
        businessName : 
    {
        type: String,
        
    },
    fastCode : 
    {
        type: Number,
        
    },
    status: {
        type: String,
        
    },

    }]
},

{ timestamps: true }
)
module.exports = mongoose.model('fastPaymentCode', fastCodeSchema)