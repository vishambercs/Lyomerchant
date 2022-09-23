const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const clientsSchema = new mongoose.Schema({
    api_key: 
    {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
            isAsync: false
        }
    },
    authtoken:
    {
        type: String,
        required: false,
        
    },
    token:
    {
        type: String,
        required: true,
        unique: true,
    },
    secret: {
        type: String,
        required: true,
    },
    qrcode: {
        type: String,
        required: true,
    },
    profileimage:
    {
        type: String,
        required: false,
    },
    hash: {
        type: String,
        required: true,
    },
    emailstatus: {
        type: Boolean,
        required: true,
    },
    loginstatus: {
        type: Boolean,
        required: true,
    },
    emailtoken: {
        type: String,
        required: true,
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
    kycLink: {
        type: String,
        required: true,
    },
    companyname: {
        type: String,
        required: false,
    },
    deleted_by: {
        type: String,
        required: false,
    },
    deleted_at: {
        type: String,
        required: false,
    },
    
    },
    { timestamps: true },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.__v;
            },
        },
    },
   
)
clientsSchema.plugin(uniqueValidator);
module.exports = mongoose.model('clients', clientsSchema)