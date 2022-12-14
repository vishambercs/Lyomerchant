const merchantcategories = require('../../Models/merchantcategory');
const network = require('../../Models/network');
const Utility = require('../../common/Utility');
var mongoose = require('mongoose');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const poolWallets = require('../../Models/poolWallet');
const Constant = require('../../common/Constant');
const manualHotWalletTransferLogs = require('../../Models/manualHotWalletTransferLogs');
require("dotenv").config()


module.exports =
{
    async createClientCategory(req, res) {
        try {
            if(req.body.id == 0){
                const merchantcategory = new merchantcategories({
                    id: mongoose.Types.ObjectId(),
                    categoryid: req.body.categoryid,
                    clientapikey: req.headers.authorization,
                    status:  req.body.status,
                    created_by: req.headers.authorization,
                });
                merchantcategory.save().then(async (val) => {
                    val["clientapikey"] = ""
                    res.json({ status: 200, message: "Successfully", data: val })
                }).catch(error => { res.json({ status: 400, data: {}, message: error }) })
            }
            else
            {
               const merchantcategory = await merchantcategories.findOne({ id : req.body.id,  clientapikey: req.headers.authorization } )
               if(merchantcategory == null)
               {
                res.json({ status: 400, message: "Invalid Request", data: {} })
               }
               else if(merchantcategory.status == 2){
                res.json({ status: 400, message: "Please Contact Admin", data: {} })
               }
               else 
               {
                const merchantcategory = await merchantcategories.findOneAndUpdate
                ({ 
                    id : req.body.id,  
                    clientapikey: req.headers.authorization },{
                        $set:{
                        status      :  req.body.status,
                        updated_at  : new Date().toString(),
                        updated_by  : req.headers.authorization,
                    }
                },{ returnDocument: 'after' } )
                res.json({ status: 200, message: "Updated Successfully", data: merchantcategory })
               }
            }
            

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    
    async getAllClientCategoryRequest(req, res) {
        try {

            if(req.body.status == undefined || req.body.status == ""){
                let allmerchantcategories = await merchantcategories.aggregate([
                    {
                        $lookup: 
                        {
                            from: "categories", // collection to join
                            localField: "categoryid",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "categoriesDetails"// output array field
                        }
                    },
                    {
                        $lookup: 
                        {
                            from: "clients", // collection to join
                            localField: "clientapikey",//field from the input documents
                            foreignField: "api_key",//field from the documents of the "from" collection
                            as: "clientdetails"// output array field
                        }
                    },
                    {
                        "$project":
                        {

                            "clientdetails.api_key": 0,
                            "clientdetails.type": 0,
                            "clientdetails.authtoken": 0,
                            "clientdetails.token": 0,
                            "clientdetails.secret": 0,
                            "clientdetails.qrcode": 0,
                            "clientdetails.emailstatus": 0,
                            "clientdetails.loginstatus": 0,
                            "clientdetails.emailtoken": 0,
                            "clientdetails.status": 0,
                            "clientdetails.two_fa": 0,
                            "clientdetails.password": 0,
                            "clientdetails.kycLink": 0,
                            "clientdetails.manual_approved_by": 0,
                            "clientdetails.manual_approved_at": 0,
                            "clientdetails.companyname": 0,
                            "clientdetails.deleted_by": 0,
                            "clientdetails.deleted_at": 0
                        }
                    }

                ]).then(async (data) => 
                {
                    res.json({ status: 200, message: "All Merchant Categories", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
            }
            else{
            let allmerchantcategories = await merchantcategories.aggregate([
                { $match: { "status": parseInt(req.body.status) } },
                {
                    $lookup: 
                    {
                        from: "categories", // collection to join
                        localField: "categoryid",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "categoriesDetails"// output array field
                    }
                },
                {
                    $lookup: 
                    {
                        from: "clients", // collection to join
                        localField: "clientapikey",//field from the input documents
                        foreignField: "api_key",//field from the documents of the "from" collection
                        as: "clientdetails"// output array field
                    }
                },
            ]).then(async (data) => 
            {
                res.json({ status: 200, message: "All Merchant Categories", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async approveClientRequest(req, res) {
        try {
            await merchantcategories.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set:
                    {
                        status: req.body.status,
                        updated_by: req.headers.authorization,
                        remarks: await Utility.checkthevalue(req.body.remarks),
                    }
                }).then(async (val) => {
                    if (val != null) 
                    {
                        const merchantcategory = await merchantcategories.findOne({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: merchantcategory })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async cancelClientRequest(req, res) {
        try {
            var dateTime = new Date();
            await merchantcategories.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set:
                    {
                        status: 4,
                        updated_by: req.headers.authorization,
                        remarks: "Cancel By Merchant"+ dateTime.toString(),
                    }
                }).then(async (val) => {
                    if (val != null) {
                        const merchantcategory = await merchantcategories.findOne({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: merchantcategory })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async getClientCategory(req, res) {
        try 
        {
            let allmerchantcategories = await merchantcategories.aggregate([
                { $match: { "clientapikey": req.headers.authorization } },
                {
                    $lookup: {
                        from: "categories", // collection to join
                        localField: "categoryid",//field from the input documents
                        foreignField: "id",//field from the documents of the "from" collection
                        as: "categoriesDetails"// output array field
                    }
                    
                },
                {
                    "$project": {
                        "clientapikey" : 0,
                        
                    }
                }
            ]).then(async (data) => 
            {
                res.json({ status: 200, message: "All Merchant Categories", data: data })
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
}