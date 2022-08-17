const admins = require('../Models/admin');

const transcationLog = require('../Models/transcationLog');
const cornJobs = require('../common/cornJobs');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../common/Utility');
var constant = require('../common/Constant');
var commonFunction = require('../common/commonFunction');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const clientWallets = require('../Models/clientWallets');
const poolWallet = require('../Models/poolWallet');
const transactionPools = require('../Models/transactionPool');
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const network    = require('../Models/network');
var mongoose     = require('mongoose');
const axios      = require('axios')
var stringify    = require('json-stringify-safe');
const Constant   = require('../common/Constant');
var otpGenerator = require('otp-generator')
require("dotenv").config()

module.exports =
{
    async signup_admin_api(req, res) 
    {
        
        var admin_api_key = crypto.randomBytes(20).toString('hex');
        var email = req.body.email
        var password = req.body.password
        var hash = CryptoJS.MD5(email + password + process.env.BASE_WORD_FOR_HASH).toString();
        const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
        const password_hash = bcrypt.hashSync(password, salt);
        let secret = authenticator.generateSecret()
        if (hash == req.body.hash) 
        {
            QRCode.toDataURL(authenticator.keyuri(req.body.email, process.env.GOOGLE_SECERT, secret)).then(async (url) => {
                const admin = new admins({
                    two_fa: false,
                    secret: secret,
                    qrcode: url,
                    status: false,
                    password: password_hash,
                    admin_api_key: admin_api_key,
                    email: req.body.email,
                });
                admin.save().then(async (val) => 
                {
                
                    res.json({ status: 200, message: "Client Added Successfully", data: val })
                
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
            }).catch(error => {
                console.log('create_merchant ', error);
                res.json({ status: 400, data: {}, message: error.message })
            });
        }
        else {
            res.json({ status: 400, data: {}, message: "Invalid Hash" })
        }
    },
    async Login(req, res) {
        try {
            let email = req.body.email;
            await admins.findOne({ 'email': email }).select('+password').then(val => {
                var password_status = bcrypt.compareSync(req.body.password, val.password);
                if (password_status == true) 
                {
                    val["admin_api_key"] = ""
                    val["qrcode"] = val["two_fa"] == false ? val["qrcode"] : ""
                    res.json({ "status": 200, "data": val, "message": "Successfully Login" })
                }
                else if (password_status == false) {
                    res.json({ "status": 400, "data": {}, "message": "Email or Password is wrong" })
                }

            }).catch(error => {
                console.log("get_clients_data", error)
                // res.json({ "error": error })
                res.json({ status: 400, data: {}, message: "Email or Password is wrong" })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Email or Password is wrong" })
        }
    },
    async Verfiy_Google_Auth(req, res) {
        try {
            let email = req.body.email
            let code = req.body.code
            admins.findOne({ 'email': email }).then(async (val) => {
                if (authenticator.check(code, val.secret)) {
                    if (val.two_fa == false) {
                        let wallet = await admins.findOneAndUpdate({ 'email': email }, { $set: { two_fa: true } }, { $new: true })
                        let data = await admins.findOne({ 'email': email })
                        res.json({ "status": 200, "data": data, "message": "Get The Data Successfully" })
                    } else {
                        res.json({ "status": 200, "data": val, "message": "Get The Data Successfully" })
                    }

                } else {
                    res.json({ "status": 400, "data": {}, "message": "Verification Failed" })
                }
            }).catch(error => {
                console.log("get_clients_data", error)
                // res.json({ "error": error })
                res.json({ status: 400, data: {}, message: "Verification Failed" })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Verification Failed" })
        }
    },
    async allAdmin(req, res) {
        try {
            await admins.find().then(val => {
                res.json({ "status": 200, "data": val, "message": "All Admins" })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: "Error" })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async reset_two_fa(req, res) 
    {
        try {
            let email = req.body.email
            let code = req.body.code
            var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false })
            admins.findOne({ 'email': email }).then(async (val) => {
                if (authenticator.check(code, val.secret)) {
                    if (val.two_fa == false) {
                        let wallet = await admins.findOneAndUpdate({ 'email': email }, { $set: { two_fa: true } }, { $new: true })
                        let data = await admins.findOne({ 'email': email })
                        res.json({ "status": 200, "data": data, "message": "Get The Data Successfully" })
                    } else {
                        res.json({ "status": 200, "data": val, "message": "Get The Data Successfully" })
                    }

                } else {
                    res.json({ "status": 400, "data": {}, "message": "Verification Failed" })
                }
            }).catch(error => {
                console.log("get_clients_data", error)
                // res.json({ "error": error })
                res.json({ status: 400, data: {}, message: "Verification Failed" })
            })
        }
        catch (error) 
        {
            res.json({ status: 400, data: {}, message: "Verification Failed" })
        }
    },
    async sendEmail(req, res) {
        try {
            var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": req.body.email, "subject": "Email Verfication Token", "templateData": { "password": "sdnkfn" } }
            let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
            console.log("error",email_response)
            res.json({ status: 200, message: "We sent token to your Email", data: email_response })
        }
        catch (error) {
            console.log("error",error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}