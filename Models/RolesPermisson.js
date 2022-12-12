const mongoose        = require('mongoose');
const validator       = require('validator');
const Roles           = require('./Roles');
const RolesPermisson  = new mongoose.Schema({
  roleid:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: Roles,
    default: null,
  },
  apipath:
  {
    type: String,
    required: true,

  },
  status:
  {
    type: Number,
    required: false,
    default: 1
  },
  created_by:
  {
    type: String,
    required: true,
  },
  updated_by:
  {
    type: String,
    required: false,
  },
},
  { timestamps: true }
)
module.exports = mongoose.model('RolesPermisson', RolesPermisson)