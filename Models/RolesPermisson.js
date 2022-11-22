const mongoose  = require('mongoose');
const validator = require('validator');
const Routes    = require('./Routes');
const Roles     = require('./Roles');


const RolesPermisson = new mongoose.Schema({
    roleid: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Roles,
		default : null,
	},
    routeid: 
    {
		type    : mongoose.Schema.Types.ObjectId,
		ref     : Routes,
		default : null,
	},
    status:
    {
        type     : Number,
        required : true,

    },
  },
  { timestamps: true }
)
module.exports = mongoose.model('RolesPermisson', RolesPermisson)