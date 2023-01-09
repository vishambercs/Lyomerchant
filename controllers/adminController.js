const admins = require('../Models/admin');
const clients = require('../Models/clients');
const transcationLog = require('../Models/transcationLog');
const adminmerchantbalance = require('../Models/adminmerchantbalance');
const topup = require('../Models/topup');
const RolesPermisson = require('../Models/RolesPermisson');
const cornJobs = require('../common/cornJobs');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../common/Utility');
var constant = require('../common/Constant');
var commonFunction = require('../common/commonFunction');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const getMerchantWallets = require('../Models/clientWallets');
const adminBalanceUpdate = require('../common/adminBalanceUpdate');
const poolWallet = require('../Models/poolWallet');
const transactionPools = require('../Models/transactionPool');
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const network = require('../Models/network');
const impersonatelog = require('../Models/impersonatelog');
var mongoose = require('mongoose');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const Constant = require('../common/Constant');
var otpGenerator = require('otp-generator')
require("dotenv").config()
const jwt = require('jsonwebtoken');
const { default: ObjectID } = require('bson-objectid');
module.exports =
{
    async signup_admin_api(req, res) {
        var admin_api_key = crypto.randomBytes(20).toString('hex');
        var email = req.body.email
        var password = req.body.password
        var hash = CryptoJS.MD5(email + password + process.env.BASE_WORD_FOR_HASH).toString();
        const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
        const password_hash = bcrypt.hashSync(password, salt);
        let secret = authenticator.generateSecret()
        var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
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

                    res.json({ status: 200, message: "Client Added Successfully", data: { "email": val.email, "id": val.id } })

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
                if (val.status == false) {
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
                email: 1,
                token: 1,
                admin_api_key: 1,
                status: 1

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
    async forgetThePassword(req, res) {
        try {
            let email = req.body.email
            var otp = otpGenerator.generate(6, { digits: true, specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false, });
            let admin = await admins.findOneAndUpdate({ 'email': email }, { $set: { otptoken: otp, status: false } }, { $new: true })
            if (admin == null) {
                res.json({ status: 200, data: {}, message: "Admin did not find." })
            }
            else {
                let url = process.env.FORGOTPASSWORD.replace("otpcode", otp);
                url = url.replace("email", email);
                var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": admin.email, "subject": "Email Verfication Token", "templateData": { "password": otp, "url": url } }
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
            await admins.find({}, { email: 1, status: 1 }).then(val => {
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
            let secret = authenticator.generateSecret()
            QRCode.toDataURL(authenticator.keyuri(req.body.email, process.env.GOOGLE_SECERT_ADMIN, secret)).then(async (url) => {
                let admin = await admins.findOneAndUpdate({ 'email': email }, { $set: { two_fa: false, secret: secret, qrcode: url } }, { $new: true })
                if (admin == null) {
                    res.json({ status: 400, data: {}, message: "Invalid User" })
                }
                else {
                    res.json({ status: 200, data: { "email": email, "secret": secret, "qrcode": url }, message: "Password Update Successfully" })
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
            if (email == "ayaz.chishti@vaimanagement.co") {
                return res.json({ status: 400, message: "Invalid Request", data: null })
            }
            await admins.updateOne({ 'email': email },
                {
                    $set:
                    {
                        status: req.body.status,
                        deleted_by: req.headers.authorization,
                        deleted_at: new Date().toString(),
                    }
                }).then(async (val) => {
                    if (val != null) {
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
    async clientimpersonate(req, res) {
        try {
            let email = req.body.email;
            let client = await clients.findOne({ email: email })
            if (client == null) {
                return res.json({ status: 200, data: {}, message: "Invalid Email" })
            }
            let token = await Utility.Get_JWT_Token(client.id)
            client = await clients.findOneAndUpdate({ email: email }, {
                $set: {
                    adminauthtoken: token
                }
            }, { 'returnDocument': 'after' })


            let impersonat = await impersonatelog.insertMany({
                id: mongoose.Types.ObjectId(),
                customerapi: client.api_key,
                adminapi: req.headers.authorization,
                createdat: new Date().toString()
            })
            let response = {
                email: email,
                token: token,
                client_api_key: client.adminauthtoken,
            }
            res.json({ status: 200, data: response, message: "Success" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
    async get_kyc_level(req, res) {
        try {
            let response = await Utility.get_KYC_Level()
            res.json({ status: 200, data: response, message: "Success" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
    async updateadminrole(req, res) {
        try {
            let admin = await admins.findOneAndUpdate({ 'email': req.body.adminemail },
                { $set: { rolesdata: req.body.roleid } },
                { returnDocument: 'after' })
            res.json({ status: 200, data: admin, message: "Success" })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
    async update_The_Transcation_BY_Admin(req, res) {
        try {
            let transactionPool = await topup.findOne({ id: req.body.id })

            if (transactionPool == null) {
                return res.json({ status: 400, data: {}, message: "Invalid Transcation ID" })

            }
            if (transactionPool.amount == 0) {
                return res.json({ status: 400, data: {}, message: "Paid Amount is zero. You can not update" })

            }

            let topup_verify = await adminBalanceUpdate.verifyTheBalanceBy_Admin(transactionPool.id, req.headers.authorization)

            if (topup_verify.status == 400) {
                return res.json({ status: 400, message: "Please Contact Admin", data: {} })
            }
            res.json({ status: 200, message: "Updated Successfully", data: { id: transactionPool.id } })

        }
        catch (error) {
            console.log("update_The_Transcation_BY_Admin", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async Get_User_Roles(req, res) {
        try {
            let admin = await admins.findOne({ admin_api_key: req.headers.authorization, token: req.headers.token })
            if (admin == null) {
                return res.json({ status: 400, data: {}, message: "Invalid User " })
            }

            let status = req.body.status == undefined || req.body.status == "" ? 1 : req.body.status

            let rolesData = await RolesPermisson.find({ roleid: admin.rolesdata, "status": status }).
            populate([{ path: "roleid", select: "_id name  " },]).
            populate([{ path: "apipath", select: "_id category name middleware " },])
            res.json({ status: 200, message: "Roles Data", data: rolesData })

        }
        catch (error) {
            console.log("Get_User_Roles", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async client_deposit_credit_balance(req, res) {
        try {
            
            let admin   = await admins.findOne({admin_api_key  : req.headers.authorization})

            let clients = await clients.findOne({api_key : req.body.client_api_key})
            
            if (admin == null )
            {
                return res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }

            if (clients == null )
            {
                return res.json({ status: 400, data: {}, message: "Invalid Merchant " })
            }

            if (req.body.id == "") {

                let adminmerchantdata = await adminmerchantbalance.insertMany({
                    cliendetails    : clients._id,
                    client_api_key  : req.body.client_api_key,
                    networkdetails  : req.body.networkdetails,
                    amount          : req.body.amount,
                    status          : req.body.status,
                    type            : req.body.type,
                    admindetails    : admin._id,
                })
                
                return res.json({ status: 200, data: adminmerchantdata, message: "Success" })
            }
            else {
                let Role = await adminmerchantbalance.findOneAndUpdate({ _id: ObjectID(req.body.id) }, { $set: { name: req.body.name, status: req.body.status, updated_by: req.headers.authorization } }, { returnDocument: 'after' })
                return res.json({ status: 200, data: Role, message: "Success" })
            }

        }
        catch (error) {
            console.log("create_or_update_roles", error)
            res.json({ status: 400, data: {}, message: "Error" })
        }

    },
}