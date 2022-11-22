const mongoose = require('mongoose');
const validator = require('validator');

const routes = new mongoose.Schema({
    path:
    {
        type        : String,
        required    : true,
    },
    status:
    {
        type: Number,
        required: true,

    },
  },
    { timestamps: true }
)
module.exports = mongoose.model('routes', routes)