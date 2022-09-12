const merchantsites = require('../../Models/merchantsites');
const transcationLog = require('../../Models/transcationLog');
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
var otpGenerator = require('otp-generator')
require("dotenv").config()

module.exports =
{
    async savemerchantsite(req, res) {
        try {
            const merchantsite = new merchantsites({
                id: mongoose.Types.ObjectId(),
                merchantapikey: req.headers.authorization,
                siteapikey: crypto.randomBytes(20).toString('hex'),
                domain: req.body.domain,
                status: 0,
                created_by: req.body.created_by,
            });
            merchantsite.save().then(async (val) => {
                res.json({ status: 200, message: "New Merchant Site", data: val })
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, message: error, data: {} })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },

    async allMerchantSites(req, res) {
        try {
            let token = req.headers.authorization
            await merchantsites.find({ 'deleted_by': 0, merchantapikey: token }).then(async (val) => {
                res.json({ status: 200, message: "get", data: val })
            }).catch(error => {
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async updateMerchantSite(req, res) {
        try {
            await merchantsites.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set:
                    {
                        domain: req.body.domain,
                        status: req.body.status,
                    }
                }).then(async (val) => {
                    if (val != null) {
                        const merchantsite = await merchantsites.findOne({ 'id': req.body.id })
                        res.json({ status: 200, message: "Successfully", data: merchantsite })
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
    async deleteMerchantSite(req, res) {
        try {
            await merchantsites.findOneAndUpdate({ 'id': req.body.id },
                {
                    $set:
                    {
                        status    : 1,
                        deleted_by: req.body.deleted_by,
                        deleted_at: Date.now(),
                    }
                }).then(async (val) => {
                    if (val != null) {
                        res.json({ status: 200, message: "Successfully", data: req.body.id })
                    }
                    else {
                        res.json({ status: 200, message: "Not Found the Data", data: null })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

}