const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const feedWalletsSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
    },
    network_id:
    {
        type: String,
        required: true,
    },
    address:
    {
        type: String,
        required: true,
    },
    privatekey:
    {
        type: String,
        required: true,
    },
    status:
    {
        type: Number,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    deleted_by: {
        type: String,
        required: false,
        default: 0
    },
    deleted_at: {
        type: String,
        required: false,
    },

},
    {
        toJSON:
        {
            transform(doc, ret) {
                delete ret.privatekey;
                delete ret.__v;
            },
        },
    },
    { timestamps: true }
)
feedWalletsSchema.plugin(uniqueValidator);
module.exports = mongoose.model('feedWallets', feedWalletsSchema)