

const clienthotwallets      = require('../../Models/clienthotwallets');

const RolesPermisson        = require('../../Models/RolesPermisson');
const cornJobs              = require('../../common/cornJobs');
var CryptoJS                = require('crypto-js')
var crypto                  = require("crypto");
var Utility                 = require('../../common/Utility');
var constant                = require('../../common/Constant');
var commonFunction          = require('../../common/commonFunction');
const bcrypt                = require('bcrypt');
const Web3                  = require('web3');
const getMerchantWallets    = require('../../Models/clientWallets');
const poolWallet            = require('../../Models/poolWallet');
const transactionPools      = require('../../Models/transactionPool');
const { authenticator }     = require('otplib')
const QRCode                = require('qrcode')
const network               = require('../../Models/network');
const impersonatelog        = require('../../Models/impersonatelog');
var mongoose                = require('mongoose');
const axios                 = require('axios')
var stringify               = require('json-stringify-safe');
const Constant              = require('../../common/Constant');
var otpGenerator            = require('otp-generator')
require("dotenv").config()
const jwt = require('jsonwebtoken');
const listEndpoints = require('express-list-endpoints');
const { default: ObjectID } = require('bson-objectid');
module.exports =
{


    async create_or_update_clienthotwallets(req, res) 
    {
        try 
        {
            if(req.body.id == "")
            {
                let clienthotwallet = await clienthotwallets.insertMany({
                    address         : req.body.address,
                    networkdetails  : req.body.networkdetails, 
                    clientdetail    : req.body.clientdetail,
                    status          : req.body.status,
                    api_key         : req.body.api_key,
                    created_by      : req.headers.authorization
                
                })
                return res.json({ status: 200, data: clienthotwallet, message: "Success" })
            }
            else
            {
                let clienthotwallet = await clienthotwallets.findOneAndUpdate( {_id : ObjectID(req.body.id) } ,
                { $set :   {
                    address         : req.body.address,
                    networkdetails  : req.body.networkdetails, 
                    clientdetail    : req.body.clientdetail,
                    status          : req.body.status,
                    api_key         : req.body.api_key,
                    updated_by      : req.headers.authorization 
                
                }}, { returnDocument:'after' })
                return res.json({ status: 200, data: clienthotwallet, message: "Success" })
            }
            
        }
        catch (error) {
            console.log("create_or_update_clienthotwallets",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async get_all_clienthotwallets(req, res) 
    {
        try 
        {
            let limit        = req.body.limit == ""   || req.body.limit == undefined ? 25 : parseInt(req.body.limit);
            let skip         = req.body.skip   == ""   || req.body.skip  == undefined  ? 0 : parseInt(req.body.skip);
            let queryOptions = {}
            let clienthotwalletsData  = await clienthotwallets.find(queryOptions, ).populate([ 
                { path: "networkdetails",         select: "id coin network _id" },
                { path: "clientdetail", select: "id email first_name last_name type _id" },
            ]).sort({createdAt : -1}).limit(limit).skip(skip).lean();
            res.json({ status: 200, data: clienthotwalletsData, message: "Success" })
        }
        catch (error) {
            console.log("get_all_roles",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_or_update_roles_permission(req, res) 
    {
        try 
        {
            
            let roles_permission = req.body.roles_permission
            
            let Role = await RolesPermisson.insertMany(roles_permission)
            return res.json({ status: 200, data: Role, message: "Success" })
            
        }
        catch (error) {
            console.log("create_or_update_roles",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async update_role_Permisson(req, res) 
    {
        try 
        {
            let rolesData  = await RolesPermisson.findOneAndUpdate({_id: ObjectID(req.body.id)} ,{ $set : {
                roleid      : req.body.roleid ,
                apipath     : req.body.apipath,
                status      : req.body.status,
                updated_by  : req.headers.authorization,
            }}, {'returnDocument' : 'after'})
            res.json({ status: 200, data: rolesData, message: "Success" })
        }
        catch (error) {
            console.log("update_role_Permisson",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}