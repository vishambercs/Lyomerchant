const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const clientapiSchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
    },
    client_api:
    {
        type: String,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    created_at: {
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

    { timestamps: true }
)
clientapiSchema.plugin(uniqueValidator);
module.exports = mongoose.model('clientapi', clientapiSchema)