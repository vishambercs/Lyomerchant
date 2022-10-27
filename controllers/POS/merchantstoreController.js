const merchantstores = require('../../Models/merchantstore');
const storeDevices   = require('../../Models/storeDevices');
const Network = require('../../Models/network');
const Utility = require('../../common/Utility');
var mongoose = require('mongoose');
var crypto = require("crypto");
const TronWeb = require('tronweb')
const { generateAccount } = require('tron-create-address')
const Web3 = require('web3');
require("dotenv").config()
var QRCode = require('qrcode')
module.exports =
{
    async createMerchantStore(req, res) {
        try {
            var api_key = crypto.randomBytes(20).toString('hex');
            let qrcodedata = JSON.stringify({

                "merchantapikey": req.headers.authorization,
                "storename": req.body.storename,
                "storeapikey": api_key,
            })
            QRCode.toDataURL(qrcodedata, async function (err, url) {
                if (!err) {
                    const merchantstore = new merchantstores({
                        id: mongoose.Types.ObjectId(),
                        clientapikey: req.headers.authorization,
                        storename: req.body.storename,
                        storeaddress: req.body.storeaddress,
                        storephone: req.body.storephone,
                        storeapikey: api_key,
                        status: 0,
                        created_by: req.headers.authorization,
                        qrcode: url,
                        storeprofile:req.body.storeprofile
                    });
                    merchantstore.save().then(async (val) => {
                        res.json({
                            status: 200, message: "Store Created Successfully", "qrcode": val.qrcode,
                            data: {  "storename": val.storename, "storeapikey": val.storeapikey }
                        })
                    }).catch(error => {
                        console.log(error)
                        res.json({ status: 400, data: {}, message: error })
                    })
                }
                else {
                    res.json({ status: 400, data: {}, message: err })
                }
            })


        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async changeMerchantStore(req, res) {
        try 
        {

            if(req.body.status == 3 || req.body.status == 4 )
            {
               return res.json({ status: 400, data: {}, message: "Please Contact Admin" })
            }
            
            
            let merchantstore =  await merchantstores.findOneAndUpdate(
                { id   : req.body.id },
                { $set :
                { 
                  status     :  req.body.status ,
                  deleted_by :  req.body.status  == 1 ?  req.headers.authorization : "",
                  updated_by :  req.body.status  == 1 ?  "" : req.headers.authorization,
                  updated_at :  req.body.status  == 1 ?  "" : new Date().toString(),
                  deleted_at :  req.body.status  == 1 ?  new Date().toString() : "",  
                }
                },
                {returnDocument: 'after'} 
            )

            if(merchantstore == null)
            {
               return res.json({ status: 400, data: merchantstore, message: "Invalid Store ID" })
            }

            let storeDevice =  await storeDevices.updateMany(
                { storekey : merchantstore.storeapikey },
                { $set :
                { 
                  status     :  req.body.status  == 0 ? 1 : 0 ,
                  deleted_by :  req.body.status  == 0 ? "" :  req.headers.authorization,
                  deleted_at :  req.body.status  == 0 ? "" :  new Date().toString(),  
                  updated_by :  req.body.status  == 0 ? req.headers.authorization  : "" ,
                  updated_at :  req.body.status  == 0 ? new Date().toString() :  ""   ,  
                }
            },
                {returnDocument: 'after'} 
            )
            res.json({ status: 200, data: merchantstore, message: "Success" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },


    async adminchangeMerchantStore(req, res) {
        try 
        {
            
            if(req.body.status == 0 || req.body.status == 1 || req.body.status == 2)
            {
               return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }
            
            let prevmerchantstore =  await merchantstores.findOne( { id   : req.body.id })
            
            if(prevmerchantstore == null)
            {
               return res.json({ status: 400, data: merchantstore, message: "Invalid Store ID" })
            }

            let merchantstore =  await merchantstores.findOneAndUpdate(
                { id   : req.body.id },
                { $set :
                { 
                  status     :  req.body.status ,
                  deleted_by :  req.body.status  == 3 ?  req.headers.authorization : prevmerchantstore.deleted_by,
                  updated_by :  req.body.status  == 3 ?  prevmerchantstore.updated_by : req.headers.authorization,
                  updated_at :  req.body.status  == 3 ?  prevmerchantstore.updated_at : new Date().toString(),
                  deleted_at :  req.body.status  == 3 ?  new Date().toString() : prevmerchantstore.updated_at,  
                }
                },
                {returnDocument: 'after'} 
            )


            let storeDevice =  await storeDevices.updateMany(
                { storekey : merchantstore.storeapikey },
                { $set :
                { 
                  status     :  req.body.status  == 3 ? 1 : 0 ,
                  deleted_by :  req.body.status  == 3 ? "" :  req.headers.authorization,
                  deleted_at :  req.body.status  == 3 ? "" :  new Date().toString(),  
                  updated_by :  req.body.status  == 3 ? req.headers.authorization  : "" ,
                  updated_at :  req.body.status  == 3 ? new Date().toString() :  ""   ,  
                }
            },
                {returnDocument: 'after'} 
            )
            res.json({ status: 200, data: merchantstore, message: "Success" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async allMerchantStore(req, res) {
        try {


            let status          = req.body.status == undefined || req.body.status == "" ? 0 : parseInt(req.body.status)
            let filter          = {}
            if(Object.keys(req.body).indexOf("clientapikey")!= -1)
            {
                filter["clientDetails.api_key"] = req.body.clientapikey
            }
            filter["status"] = status
            await merchantstores.aggregate([
               
                {
                    $lookup:
                    {
                        from: "clients",                               //  collection to join
                        localField: "clientapikey",                   //  field from the input documents
                        foreignField: "api_key",                     //  field from the documents of the "from" collection
                        as: "clientDetails"                         //  output array field
                    },
                },
                {
                    $lookup:
                    {
                        from: "fastPaymentCode",                    //  collection to join
                        localField: "id",                           //  field from the input documents
                        foreignField: "storeid",                    //  field from the documents of the "from" collection
                        as: "fastPaymentcodedetails"                //  output array field
                    },
                },
                { $match: filter },
            ]).then(async (data) => {
                res.json({ status: 200, message: "All Merchant POS", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async MerchantStore(req, res) {
        try {
            await merchantstores.aggregate([
                { "$match": { "status": 0, "clientapikey": req.headers.authorization, } },
                {
                    $lookup: {
                        from: "clients", // collection to join
                        localField: "clientapikey",//field from the input documents
                        foreignField: "api_key",//field from the documents of the "from" collection
                        as: "clientDetails"// output array field
                    },
                    
                },
                {
                    "$project":
                    {
                        "id"                  : 1,
                        "storename"           : 1,
                        "storeapikey"         : 1,
                        "storeprofile"        : 1,
                        "storeaddress"        : 1,
                        "storephone"          : 1,
                        "qrcode"              : 1,
                        "status"              : 1,
                        "clientDetails.email" : 1,
                        
                    }
                }
            ]).then(async (data) => {
                res.json({ status: 200, message: "Merchant Stores", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async updateMerchantStoreProfile(req, res) {
        try {


            let update = await merchantstores.findOneAndUpdate({ 'id': req.body.id,'clientapikey': req.headers.authorization } , { $set: { 
                storeprofile    : req.body.storeprofile,
                storename       : req.body.storename,
                storeaddress    : req.body.storeaddress,
                storephone      : req.body.storephone,

            } }, { returnDocument: 'after' } )
            update["clientapikey"] = ""
            res.json({ status: 200, data: {update}, message: "update profile" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async createMerchantStoreByAdmin(req, res) {
        try {
            var api_key = crypto.randomBytes(20).toString('hex');
            let qrcodedata = JSON.stringify({

                "merchantapikey": req.body.clientapikey,
                "storename": req.body.storename,
                "storeapikey": api_key,
            })
            QRCode.toDataURL(qrcodedata, async function (err, url) {
                if (!err) {
                    const merchantstore = new merchantstores({
                        id: mongoose.Types.ObjectId(),
                        clientapikey: req.body.clientapikey,
                        storename: req.body.storename,
                        storeapikey: api_key,
                        status: 0,
                        created_by: req.headers.authorization,
                        qrcode: url,
                        storeprofile:req.body.storeprofile
                    });
                    merchantstore.save().then(async (val) => {
                        res.json({
                            status: 200, message: "Store Created Successfully", "qrcode": val.qrcode,
                            data: {  "storename": val.storename, "storeapikey": val.storeapikey }
                        })
                    }).catch(error => {
                        console.log(error)
                        res.json({ status: 400, data: {}, message: error })
                    })
                }
                else {
                    res.json({ status: 400, data: {}, message: err })
                }
            })


        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async createMerchantStoreByAdmin(req, res) {
        try {
            var api_key = crypto.randomBytes(20).toString('hex');
            let qrcodedata = JSON.stringify({

                "merchantapikey": req.body.clientapikey,
                "storename": req.body.storename,
                "storeapikey": api_key,
            })
            QRCode.toDataURL(qrcodedata, async function (err, url) {
                if (!err) {
                    const merchantstore = new merchantstores({
                        id: mongoose.Types.ObjectId(),
                        clientapikey: req.body.clientapikey,
                        storename: req.body.storename,
                        storeaddress: req.body.storeaddress,
                        storephone: req.body.storephone,
                        storeapikey: api_key,
                        status: 0,
                        created_by: req.headers.authorization,
                        qrcode: url,
                        storeprofile:req.body.storeprofile
                    });
                    merchantstore.save().then(async (val) => {
                        res.json({
                            status: 200, message: "Store Created Successfully", "qrcode": val.qrcode,
                            data: { "merchantapikey": val.clientapikey, "storename": val.storename, "storeapikey": val.storeapikey }
                        })
                    }).catch(error => {
                        console.log(error)
                        res.json({ status: 400, data: {}, message: error })
                    })
                }
                else {
                    res.json({ status: 400, data: {}, message: err })
                }
            })


        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },


}