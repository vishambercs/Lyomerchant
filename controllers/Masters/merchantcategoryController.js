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
            const merchantcategory = new merchantcategories({
                id: mongoose.Types.ObjectId(),
                categoryid: req.body.categoryid,
                clientapikey: req.headers.authorization,
                status: 0,
                created_by: req.headers.authorization,
            });
            merchantcategory.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async getAllClientCategoryRequest(req, res) {
        try {
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
    async cancelClientRequest(req, res) {
        try {
            await merchantcategories.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set:
                    {
                        status: 4,
                        updated_by: req.headers.authorization,
                        remarks: "Cancel By Merchant"+ DATE.now(),
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