const mongoose = require('mongoose');
const validator = require('validator');

const roles = new mongoose.Schema({
    name:
    {
        type        : String,
        required    : true,
    },
    status:
    {
        type     : Number,
        required : true,

    },
  },
    { timestamps: true }
)
module.exports = mongoose.model('roles', roles)