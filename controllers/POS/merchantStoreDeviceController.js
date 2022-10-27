const storeDevices = require('../../Models/storeDevices');
const merchantstore = require('../../Models/merchantstore');
const cornJobs = require('../../common/cornJobs');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../../common/Utility');
var constant = require('../../common/Constant');
var commonFunction = require('../../common/commonFunction');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const clientWallets = require('../../Models/clientWallets');
const poolWallet = require('../../Models/poolWallet');
const transactionPools = require('../../Models/transactionPool');
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const network = require('../../Models/network');
var mongoose = require('mongoose');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const Constant = require('../../common/Constant');
var otpGenerator = require('otp-generator');
const { getEnabledCategories } = require('trace_events');
require("dotenv").config()

module.exports =
{
    async regsiterStoreDevices(req, res) {
        try {
            var otp = Math.floor(1000 + Math.random() * 9000);
            var prevstoredevice = await storeDevices.findOne({ deviceid: req.body.deviceid })
            let customerdata = await merchantstore.aggregate([
                { $match: { storeapikey: req.headers.authorization } },
                {
                    $lookup: {
                        from: "clients", // collection to join
                        localField: "clientapikey",//field from the input documents
                        foreignField: "api_key",//field from the documents of the "from" collection
                        as: "clientsdetails"// output array field
                    },
                },
            ])
            if (prevstoredevice == null) {
                const storeDevice = new storeDevices({
                    id: mongoose.Types.ObjectId(),
                    storekey: req.headers.authorization,
                    devicetoken: crypto.randomBytes(20).toString('hex'),
                    otptoken: otp,
                    status: 0,
                    deviceid: req.body.deviceid,
                    devicedata: req.body.devicedata,
                });
                storeDevice.save().then(async (val) => {

                    var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": customerdata[0].clientsdetails[0].email, "subject": "Email Verfication Token", "templateData": { "password": otp } }
                    let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
                    res.json({ status: 200, message: "Please Check Email we send otp", data: { id: val.id, devicetoken: val.devicetoken, deviceid: val.deviceid, devicedata: val.devicedata } })
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, message: error, data: {} })
                })
            }
            else {
                var updateprevstoredevice = await storeDevices.findOneAndUpdate({ 'deviceid': req.body.deviceid }, { $set: { "status": 0, 'otptoken': otp, "devicedata": req.body.devicedata } })
                var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": customerdata[0].clientsdetails[0].email, "subject": "Email Verfication Token", "templateData": { "password": otp } }
                let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
                res.json({ status: 200, message: "Please Check Email we send otp", data: { id: prevstoredevice.id, devicetoken: prevstoredevice.devicetoken, deviceid: prevstoredevice.deviceid, devicedata: prevstoredevice.devicedata } })
            }
        }
        catch (error) {

            res.json({ status: 400, data: {}, message: "Please Contact Admin" })
        }
    },
    async verifyDeviceOTP(req, res) {
        try {
            await storeDevices.findOneAndUpdate({ 'devicetoken': req.headers.devicetoken, 'otptoken': req.body.otptoken }, { $set: { "status": 1 } }).then(async (val) => {
                if (val == null) {
                    res.json({ status: 400, message: "Invalid Token", data: null })
                }
                else {
                    res.json({ status: 200, message: "Device Added To Store", data: {} })
                }

            }).catch(error => {
                console.log("401", error)
                res.json({ status: 401, data: {}, message: "Please Contact Admin" })
            })
        }
        catch (error) {
            console.log("400", error)
            res.json({ status: 400, data: {}, message: "Please Contact Admin" })
        }
    },
    async getAllStoreDevice(req, res) {
        try {
            let filters = {} 
            
            if( Object.keys(req.body).indexOf('status') != -1){
                filters["status"] = parseInt(req.body.status)
            }
            filters["storekey"] = req.headers.authorization
            let allstoreDevices = await storeDevices.aggregate([
                { $match: filters },
                {
                    $lookup: 
                    {
                        from            : "merchantstores", // collection to join
                        localField      : "storekey",       //field from the input documents
                        foreignField    : "storeapikey",    //field from the documents of the "from" collection
                        as              : "storedetails"// output array field
                    },
                },
                {
                    "$project":
                    { 
                        "otptoken": 0,
                        "storedetails.clientapikey": 0,
                    }
                }
            ])
            res.json({ status: 200, data: allstoreDevices, message: "All Store Devices" })
        }
        catch (error) {
            console.log("400", error)
            res.json({ status: 400, data: {}, message: "Please Contact Admin" })
        }
    },
    async getAllStoreDeviceForAdmin(req, res) {
        try {
        
          
                let allstoreDevices = await storeDevices.aggregate([
                   
                    {
                        $lookup: {
                            from: "merchantstores", // collection to join
                            localField: "storekey",//field from the input documents
                            foreignField: "storeapikey",//field from the documents of the "from" collection
                            as: "storedetails"// output array field
                        },
                    },
                    { $match: { "storedetails.clientapikey": req.headers.authorization } },
                ])
                res.json({ status: 200, data: allstoreDevices, message: "All Store Devices" })
            
            
        }
        catch (error) {
            console.log("400", error)
            res.json({ status: 400, data: {}, message: "Please Contact Admin" })
        }
    },
    async disableordelete(req, res) {
        try {
            let storeDevice = await storeDevices.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set: 
                    {
                        "status": req.body.status,
                        "deleted_by": req.headers.authorization,
                        "deleted_at": new Date().toString()
                    }
                }, { $new: true })
            if (storeDevice == null) {
                res.json({ status: 400, data: {}, message: "Invalid Request" })
            }
            else {
                res.json({ status: 200, data: storeDevice, message: "Update Successfully" })
            }

        }
        catch (error) {
            console.log("400", error)
            res.json({ status: 400, data: {}, message: "Please Contact Admin" })
        }
    },
    async getAllClientStoreDevices(req, res) {
        try {
            
            let status          = req.body.status == undefined || req.body.status == "" ? 0 : parseInt(req.body.status)
            let filter          = {}
            if(Object.keys(req.body).indexOf("storekey")!= -1)
            {
                filter["storekey"] =     req.body.storekey 
            }
            filter["storedetails.clientapikey"] = req.headers.authorization   
            filter["status"] = status
            let allstoreDevices = await storeDevices.aggregate([
                {
                        $lookup: 
                        {
                            from            : "merchantstores", // collection to join
                            localField      : "storekey",//field from the input documents
                            foreignField    : "storeapikey",//field from the documents of the "from" collection
                            as              : "storedetails"// output array field
                        },
                },
                { $match: filter },
            ])
            res.json({ status: 200, data: allstoreDevices, message: "All Store Devices" })
        
       }
        catch (error) {
            console.log("400", error)
            res.json({ status: 400, data: {}, message: "Please Contact Admin" })
        }
    },
}