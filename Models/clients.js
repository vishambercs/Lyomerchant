const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
const clientsSchema = new mongoose.Schema({
    api_key: 
    {
        type: String,
        required: true,
    },
    first_name: 
    {
        type: String,
        required: true,
    },
    last_name: 
    {
        type: String,
        required: true,
    },
    type: 
    {
        type: String,
        enum : ['Individual','Company'],
        required: true,
    },
    companyname: 
    {
        type: String,
        required: false,
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
clientsSchema.plugin(uniqueValidator);
module.exports = mongoose.model('clients', clientsSchema)