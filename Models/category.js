const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const categorySchema = new mongoose.Schema({
    id:
    {
        type: String,
        required: true,
    },
    prefix:
    {
        type: String,
        required: true,
    },
    title:
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
        type: Number,
        required: true,
    },
    deleted_by: {
        type: Number,
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
categorySchema.plugin(uniqueValidator);
module.exports = mongoose.model('category', categorySchema)