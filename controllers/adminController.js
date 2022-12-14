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
const getMerchantWallets = require('../Models/clientWallets');
const poolWallet = require('../Models/poolWallet');
const transactionPools = require('../Models/transactionPool');
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const network = require('../Models/network');
var mongoose = require('mongoose');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const Constant = require('../common/Constant');
var otpGenerator = require('otp-generator')
require("dotenv").config()
const jwt = require('jsonwebtoken');
module.exports =
{
    async signup_admin_api(req, res) {
        var admin_api_key   = crypto.randomBytes(20).toString('hex');
        var email           = req.body.email
        var password        = req.body.password
        var hash            = CryptoJS.MD5(email + password + process.env.BASE_WORD_FOR_HASH).toString();
        const salt          = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
        const password_hash = bcrypt.hashSync(password, salt);
        let secret          = authenticator.generateSecret()
        
        var otp             = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        if (hash == req.body.hash) {
            QRCode.toDataURL(authenticator.keyuri(req.body.email, process.env.GOOGLE_SECERT_ADMIN, secret)).then(async (url) => {
                const admin = new admins({
                    two_fa: false,
                    secret: secret,
                    qrcode: url,
                    otptoken: otp,
                    status: true,
                    password: password_hash,
                    admin_api_key: admin_api_key,
                    email: req.body.email,
                });
                admin.save().then(async (val) => {

                    res.json({ status: 200, message: "Client Added Successfully", data: { "email": val.email , "id": val.id } })

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
            await admins.findOne({ 'email': email }).select('+password').then(async (val) => {
                var password_status = bcrypt.compareSync(req.body.password, val.password);
                if (val.status == false) 
                {
                    res.json({ "status": 400, "data": {}, "message": "Your account has disabled" })
                }
                else if (password_status == true) {
                    val["admin_api_key"] = ""
                    val["qrcode"] = val["two_fa"] == false ? val["qrcode"] : ""
                    val["secret"] = val["two_fa"] == false ? val["secret"] : ""
                    let jwttoken = await Utility.Get_JWT_Token(val.id)
                    let wallet = await admins.findOneAndUpdate({ 'email': email }, { $set: { token: jwttoken } }, { $new: true })
                    val["token"] = jwttoken
                    res.json({ "status": 200, "data": val, "message": "Successfully Login" })
                }
                else if (password_status == false) {
                    res.json({ "status": 400, "data": {}, "message": "Email or Password is wrong" })
                }

            }).catch(error => {

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
            let data = await admins.findOne({ 'email': email }, {
                email:1,
                token:1,
                admin_api_key:1,
                status:1
                
            })

            admins.findOne({ 'email': email }).then(async (val) => {
                
                if (authenticator.check(code, val.secret)) {
                    if (val.two_fa == false) {

                        let wallet = await admins.findOneAndUpdate({ 'email': email }, { $set: { two_fa: true } }, { $new: true })
                     

                        res.json({ "status": 200, "data": data, "message": "Get The Data Successfully" })
                    } else {
                        res.json({ "status": 200, "data": data, "message": "Get The Data Successfully" })
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
    async forgetThePassword(req, res) 
    {
        try {
            let email = req.body.email
            var otp = otpGenerator.generate(6, { digits: true ,specialChars :false,lowerCaseAlphabets :false,upperCaseAlphabets :false,});
            let admin = await admins.findOneAndUpdate({ 'email': email }, { $set: { otptoken: otp, status: false } }, { $new: true })
            if (admin == null) 
            {
                res.json({ status: 200, data: {}, message: "Admin did not find." })
            }
            else 
            {
                let url = process.env.FORGOTPASSWORD.replace("otpcode", otp);
                url = url.replace("email", email);
                var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": admin.email, "subject": "Email Verfication Token", "templateData": { "password": otp,   "url":url } }
                let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
                console.log("email_response", email_response)
                res.json({ status: 200, data: email, message: "We send a code to your email." })
            }
        }
        catch (error) {
            console.log("email_response", error)
            res.json({ status: 400, data: {}, message: "error" })
        }
    },
    async VerfiyTheCode(req, res) {
        try {
            let email = req.body.email
            var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
            let admin = await admins.findOneAndUpdate({ 'email': email, otptoken: req.body.token, status: false }, { $set: { status: false } }, { $new: true })
            if (admin == null) {
                res.json({ status: 200, data: {}, message: "Invalid Token" })
            }
            else {
                res.json({ status: 200, data: email, message: "Verfied" })
            }
        }
        catch (error) {
            console.log("email_response", error)
            res.json({ status: 400, data: {}, message: "error" })
        }
    },
    async updateThePassword(req, res) {
        try {
            let email = req.body.email
            let otp = req.body.token
            const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
            const password_hash = bcrypt.hashSync(req.body.password, salt);
            let admin = await admins.findOneAndUpdate({ 'email': email, "otptoken": otp }, { $set: { password: password_hash, status: true } }, { $new: true })
            if (admin == null) {
                res.json({ status: 400, data: {}, message: "Invalid User" })
            }
            else {
                res.json({ status: 200, data: email, message: "Password Update Successfully" })
            }
        }
        catch (error) {
            console.log("email_response", error)
            res.json({ status: 400, data: {}, message: "error" })
        }
    },
    async allAdmin(req, res) {
        try {
            await admins.find({},{ email:1, status : 1 }).then(val => 
            {
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
    async reset_two_fa(req, res) {
        try {
            let email = req.body.email
            let secret          = authenticator.generateSecret()
            QRCode.toDataURL(authenticator.keyuri(req.body.email, process.env.GOOGLE_SECERT_ADMIN, secret)).then(async (url) => {
            let admin = await admins.findOneAndUpdate({ 'email': email }, { $set: { two_fa: false, secret: secret, qrcode: url } }, { $new: true })
            if (admin == null) 
            {
                res.json({ status: 400, data: {}, message: "Invalid User" })
            }
            else 
            {
                res.json({ status: 200, data: { "email": email, "secret": secret, "qrcode": url  }, message: "Password Update Successfully" })
            }
        })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Verification Failed" })
        }
    },
    async sendEmail(req, res) {
        try {
            var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": req.body.email, "subject": "Email Verfication Token", "templateData": { "password": "sdnkfn" } }
            let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
            console.log("error", email_response)
            res.json({ status: 200, message: "We sent token to your Email", data: email_response })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async getapikey(req, res) {
        try {
            let email = req.body.email;
            await admins.findOne({ 'email': email }).then(async (val) => {

                if (val != null) {

                    res.json({ "status": 200, "data": val["admin_api_key"], "message": "Success" })
                }
                else {
                    res.json({ "status": 400, "data": {}, "message": "Invalid Request" })
                }

            }).catch(error => {
                console.log("get_clients_data", error)
                // res.json({ "error": error })
                res.json({ status: 400, data: {}, message: "Invalid Request" })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
    async changeAdminsLoginStatus(req, res) {
        try {
            let email = req.body.email;
            if(email == "ayaz.chishti@vaimanagement.co"){
              return  res.json({ status: 400, message: "Invalid Request", data: null })
            }
            await admins.updateOne({ 'email': email },
                {
                    $set:
                    {
                        status: req.body.status,
                        deleted_by: req.headers.authorization,
                        deleted_at: new Date().toString(),
                    }
                }).then(async (val) => 
                {
                    if (val != null) 
                    {
                        res.json({ status: 200, message: "Successfully", data: req.body.email })
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
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
}