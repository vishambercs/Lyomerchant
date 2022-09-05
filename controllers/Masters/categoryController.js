const categories = require('../../Models/category');
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
    
    async savecategory(req, res) {
        try {
            const category = new categories({
                id: crypto.randomBytes(20).toString('hex'),
                prefix: req.body.prefix,
                title: req.body.title,
                status: req.body.status,
                created_by: req.body.created_by,
            });
            category.save().then(async (val) => {
                res.json({ status: 200, message: "New Category Added", data: val })
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, message: error, data: {} })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Email or Password is wrong" })
        }
    },

    async allcategory(req, res) {
        try {

            await categories.find({ 'deleted_by': 0 }).then(async (val) => {
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
    
}