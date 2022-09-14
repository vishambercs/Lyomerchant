const mongoose = require('mongoose');
const validator = require('validator');


const fastCodeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    storeid :
    {
        type: String,
        required: true,
    },
    fastcodes :
    {
        type: String,
        required: true,
        unique: true,
    },
    status: 
    {
        type: Number,
        required: true,
    },

},

{ timestamps: true }
)
module.exports = mongoose.model('fastPaymentCode', fastCodeSchema)