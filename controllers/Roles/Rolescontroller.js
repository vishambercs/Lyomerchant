const admins = require('../../Models/admin');
const clients = require('../../Models/clients');
const api_lists = require('../../Models/api_list');
const Roles = require('../../Models/Roles');
const transcationLog = require('../../Models/transcationLog');
const RolesPermisson = require('../../Models/RolesPermisson');
const cornJobs = require('../../common/cornJobs');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../../common/Utility');
var constant = require('../../common/Constant');
var commonFunction = require('../../common/commonFunction');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const getMerchantWallets = require('../../Models/clientWallets');
const poolWallet = require('../../Models/poolWallet');
const transactionPools = require('../../Models/transactionPool');
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const network = require('../../Models/network');
const impersonatelog = require('../../Models/impersonatelog');
var mongoose = require('mongoose');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const Constant = require('../../common/Constant');
var otpGenerator = require('otp-generator')
const { default: ObjectID } = require('bson-objectid');
const jwt = require('jsonwebtoken');
const listEndpoints = require('express-list-endpoints');
require("dotenv").config()
async function Save_API_List(id,api_path, category, name, description,middleware) {
    try {
      
    let api_list = await api_lists.findOneAndUpdate({ api_path : api_path},{ $set : {
        api_path    : api_path,
        category    : category,
        name        : name,
        description : description,
        middleware  : middleware,
        status: 1,
    }},{returnDocument : 'after'})
   
    console.log("Save_API_List",api_list)
    return api_list

}
catch (error) {
    console.log("error", error)
    return null
}
 }
module.exports =
{
    async get_all_all_API(req, res) {
        try {

            // constant.updating.forEach( async (element) => {
            //     console.log("element",element)
            //     await Save_API_List(element._id,element.api_path, element.category, element.name, element.description, element.middleware)
            // })
            // constant.ALL_API.forEach( async (element) => {
            //     if(element.path.includes("admin") )
            //     {
            //         await Save_API_List(element.path,"Admin","Admin can"+element.path," ")
            //     }
            //     else if(element.path.includes("network") )
            //     {
            //         await Save_API_List(element.path,"Network","Admin can"+element.path," ")
            //     }
            //     else if(element.path.includes("paymentlink") )
            //     {
            //         await Save_API_List(element.path,"Payment Link","Admin can"+element.path," ")
            //     }
            //     else if(element.path.includes("wallet") )
            //     {
            //         await Save_API_List(element.path,"Wallet","Admin can"+element.path," ")
            //     }
            //     else if(element.path.includes("hotWallet") )
            //     {
            //         await Save_API_List(element.path,"Hot Wallet","Admin can"+element.path," ")
            //     }
            //     else if( element.path.includes("withdraw") )
            //     {
            //         await Save_API_List(element.path,"Withdraw","Admin can"+element.path," ")
            //     }
            //     else
            //     {
            //         await Save_API_List(element.path,"Clients","Admin can"+element.path," ")
            //     }
            //   });

            // let api_list = await api_lists.find({ status: 1, }).sort({category : 1 })

            let api_list = await api_lists.aggregate(

                [
                    { $match: { "status": 1 } },
                    { $group: { _id: "$category", roles: { $push: "$$ROOT" } } }
                ]

            )
            res.json({ status: 200, data: api_list, message: "Success" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_or_update_api_paths(req, res) {
        try {
            if (req.body.id == "") {
                let api_list = await api_lists.insertMany({
                    api_path: req.body.api_path,
                    category: req.body.category,
                    name: req.body.name,
                    description: req.body.description,
                    status: req.body.status,
                })
                return res.json({ status: 200, data: api_list, message: "Success" })
            }
            else {
                let api_list = await api_lists.findOneAndUpdate(
                    { _id: ObjectID(req.body.id) }, {
                    $set: {
                        api_path: req.body.api_path,
                        category: req.body.category,
                        name: req.body.name,
                        description: req.body.description,
                        status: req.body.status,
                    }
                }, { returnDocument: 'after' })
                return res.json({ status: 200, data: api_list, message: "Success" })
            }

        }
        catch (error) {
            console.log("get_all_all_API", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_or_update_roles(req, res) {
        try {
            if (req.body.id == "") {
                let Role = await Roles.insertMany({ name: req.body.name, status: req.body.status, created_by: req.headers.authorization })
                return res.json({ status: 200, data: Role, message: "Success" })
            }
            else {
                let Role = await Roles.findOneAndUpdate({ _id: ObjectID(req.body.id) }, { $set: { name: req.body.name, status: req.body.status, updated_by: req.headers.authorization } }, { returnDocument: 'after' })
                return res.json({ status: 200, data: Role, message: "Success" })
            }

        }
        catch (error) {
            console.log("create_or_update_roles", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async get_all_roles(req, res) {
        try {
            let limit = req.body.limit == "" || req.body.limit == undefined ? 25 : parseInt(req.body.limit);
            let skip = req.body.skip == "" || req.body.skip == undefined ? 0 : parseInt(req.body.skip);
            let queryOptions = {}

            let rolesData = await Roles.find(queryOptions).sort({ createdAt: -1 }).limit(limit).skip(skip).lean();
            return res.json({ status: 200, data: rolesData, message: "Success" })

           
        }
        catch (error) {
            console.log("get_all_roles", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async get_all_roles_with_permission(req, res) {
        try {
            let limit = req.body.limit == "" || req.body.limit == undefined ? 25 : parseInt(req.body.limit);
            let skip = req.body.skip == "" || req.body.skip == undefined ? 0 : parseInt(req.body.skip);
            let queryOptions = { "status": { $ne: 0 } }

            let rolesData = await RolesPermisson.find(queryOptions,).populate([{ path: "roleid", select: "_id name " },]).
            populate([{ path: "apipath", select: "_id category name " },]).sort({ createdAt: -1 }).limit(limit).skip(skip).lean();
            res.json({ status: 200, data: rolesData, message: "Success" })
        }
        catch (error) {
            console.log("get_all_roles", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async get_permission_of_role(req, res) {
        try {
           
            let queryOptions = { "status": { $ne: 0 } }
            
            if(req.body?.status)
            {
                queryOptions["status"] =  req.body.status 
            }
            queryOptions["roleid"] =  req.body.roleid
            let rolesData = await RolesPermisson.find(queryOptions).populate([{ path: "roleid", select: "_id name " },]).
            populate([{ path: "apipath", select: "_id category name status" },]).sort({ createdAt: -1 })
            res.json({ status: 200, data: rolesData, message: "Success" })
        }
        catch (error) {
            console.log("get_all_roles", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_or_update_roles_permission(req, res) {
        try {

            let roles_permission = req.body.roles_permission
            let Role = await RolesPermisson.insertMany(roles_permission)
            return res.json({ status: 200, data: Role, message: "Success" })

        }
        catch (error) {
            console.log("create_or_update_roles", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async update_role_Permisson(req, res) {
        try {
            let roles_permission = req.body.roles_permission
            let roles_data = []
            for (var index=0; index<roles_permission.length ; index++  ){
                let element = roles_permission[index]
                console.log(element)
                let rolesData = await RolesPermisson.findOneAndUpdate({ _id: element.id }, {
                    $set: {
                        roleid      : element.roleid,
                        apipath     : element.apipath,
                        status      : element.status,
                        updated_by  : req.headers.authorization,
                    }
                }, { 'returnDocument': 'after' })
                roles_data.push(rolesData)
            
            }
           
            
            res.json({ status: 200, data: roles_data, message: "Update Successfully" })
        }
        catch (error) {
            console.log("update_role_Permisson", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async updatecategory(req, res) {
        try 
        {
            let rolesData = await api_lists.updateMany({ "category" : req.body.category },{ $set: { status : 0 } })
            res.json({ status: 200, data: rolesData, message: "Success" })
        }
        catch (error) {
            console.log("get_all_roles", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async savecategory(req, res) {
        try 
        {
            let api_list = await api_lists.insertMany([ {
                api_path    : req.body.api_path,
                category    : req.body.category,
                name        : req.body.name,
                description : req.body.description,
                middleware  : req.body.middleware,
                status      : 1,
            } ])
            res.json({ status: 200, data: api_list, message: "Success" })
        }
        catch (error) {
            console.log("savecategory", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}