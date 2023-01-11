const mongoose        = require('mongoose');
const validator       = require('validator');
const Roles           = require('./Roles');
const api_list           = require('./api_list');
const RolesPermisson  = new mongoose.Schema({
  roleid:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: Roles,
    default: null,
  },
  apipath:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: api_list,
    default: null,

  },
  
  status:
  {
      type     : Number,
      required : true,

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