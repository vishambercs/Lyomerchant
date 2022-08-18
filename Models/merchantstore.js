const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const merchantstoreSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
    },
    clientapikey:
    {
        type: String,
        required: true,
    },
    storename:
    {
        type: String,
        required: true,
    },
    storeapikey:
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
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.__v;
            },
        },
    },
    { timestamps: true }
)
merchantstoreSchema.plugin(uniqueValidator);
module.exports = mongoose.model('merchantstoreSchema', merchantstoreSchema)