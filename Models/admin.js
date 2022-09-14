const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const adminSchema = new mongoose.Schema({
    admin_api_key: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: 
        {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
            isAsync: false
        }
    },
    token: 
    {
        type: String,
        required: false,
    },
    secret: {
        type: String,
        required: true,
    },
    qrcode: {
        type: String,
        required: true,
    },
    otptoken: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: false,
    },
    status: {
        type: Boolean,
        required: true,
    },
    two_fa: {
        type: Boolean,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    deleted_by: {
        type: String,
        required: true,
    },
    deleted_at: {
        type: String,
        required: true,
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
adminSchema.plugin(uniqueValidator);
module.exports = mongoose.model('admin', adminSchema)