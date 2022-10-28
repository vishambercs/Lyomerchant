const client = require('../Models/clients');
const admins = require('../Models/admin');
const merchantstores = require('../Models/merchantstore');
const merchantcategory = require('../Models/merchantcategory');
const storeDevices = require('../Models/storeDevices');
const paymentLinkTransactionPool = require('../Models/paymentLinkTransactionPool');
const payLink = require('../Models/payLink');
const invoice = require('../Models/invoice');
const Validator = require('./index');
const jwt = require('jsonwebtoken');
const fastPaymentCode = require('../Models/fastPaymentCode');
const merchantstore = require('../Models/merchantstore');
const clients = require('../Models/clients');

require("dotenv").config()
module.exports =
{

    
    async Verfiy_Merchant(req, res, next) {
        try {
            let api_key = req.headers.authorization;
            let token = req.headers.token;
            client.find({ 'token': token, 'api_key': api_key, status: true,disablestatus : false }).then(val => {
                if (val != null) {
                    next()
                }
                else {
                    res.json({ status: 400, data: {}, message: "Unauthorize Access" })
                }

            }).catch(error => {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            })

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

    async checkaccess(req, res, next) {
        try {

            let api_key = req.headers.authorization;
            let user = await merchantcategory.findOne({ $and: [{ clientapikey: api_key }, { status: 1 }] });
            if (user != null) {
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Invalid Request" })
            }

        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "Invalid Request" })
        }
    },

    async plugin_have_access(req, res, next) {
        try {

            let api_key = req.headers.authorization;
            let user = await merchantcategory.findOne({ $and: [{ clientapikey: api_key }, { categoryid: "30824fa99994057dea6102194f3cafd88de16144" }, { status: 1 }] });
            if (user != null) {
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "You have not plugin access. Please create a request for this service." })
            }

        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "You have not plugin access. Please create a request for this service." })
        }
    },

    async Verfiy_Kyc_Header(req, res, next) {
        try {
            console.log("Verfiy_Kyc_Header ===========", req.body)
            if (process.env.KYC_HEADER_AUTH == req.headers.auth) {
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    verfiy_The_Merchant(req, res, next) {
        try {
            const validationRule =
            {
                "networkType": "required|string",
                "callbackURL": "required|string",
                "securityHash": "required|string",
                "orderid": "required|string",
                "token": "required|string",
                "currency": "required|string",
                "amount": "required|decimal",
                "categoryid": "required|string",
            }
            Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(412).send({ status: 412, message: 'Validation failed', data: err });
                }
                // else if(){

                // } 
                else {
                    next();
                }
            });
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: error.message })
        }
    },
    async is_admin(req, res, next) {
        try {
            let token = req.headers.token;
            let authorization = req.headers.authorization;
            let user = await admins.findOne({ admin_api_key: authorization ,token :token,  status :true });
            if (user != null) 
            {
                let profile = jwt.verify(token, process.env.AUTH_KEY)
                req.user = profile
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async verfiyAdminToken(req, res, next) {
        try {
            let token = req.headers.token;
            let authorization = req.headers.authorization;
            let user = await admins.findOne({ token: token });
            if (user != null) {
                let profile = jwt.verify(token, process.env.AUTH_KEY)
                req.user = profile
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }
        }
        catch (error) {
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verfiyClientToken(req, res, next) {
        try {
            let token = req.headers.token;
            let authorization = req.headers.authorization;
            let user = await client.findOne({ token: token });
            if (user != null) {
                let profile = jwt.verify(token, process.env.AUTH_KEY)
                req.user = profile
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async verifymerchant(req, res, next) {
        try {
            let token = req.headers.token;
            let authorization = req.headers.authorization;
            let user = await clients.findOne({ authtoken:token });
            if (user != null) {
                let profile = jwt.verify(token, process.env.AUTH_KEY)
                req.user = profile
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
        
    },

    async is_merchant(req, res, next) {
        try {
            let token = req.headers.token;
            let authorization = req.headers.authorization;
            let user = await clients.findOne({ api_key: authorization,authtoken:token });
            if (user != null) {
                let profile = jwt.verify(token, process.env.AUTH_KEY)
                req.user = profile
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            }
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
        
    },
    async has_Pos_Access(req, res, next) {
        try {
            let token = req.headers.authorization;
            let user = await merchantcategory.findOne({ $and: [{ clientapikey: token }, { categoryid: "306d04e5ccf554ffcaebe1b929a6dbc27bc04a3b" }, { status: 1 }] });
            if (user != null) 
            {
                next()
            }
            else 
            {
                res.json({ status: 400, data: {}, message: "You have not pos access. Please create the service request." })
            }
        }
        catch (error) {

            res.json({ status: 401, data: {}, message: "You have not pos access. Please create the service request." })
        }
    },
    async store_have_access(req, res, next) {
        try {
            let token = req.headers.authorization;
            let merchantstore = await merchantstores.findOne({ $and: [{ storeapikey: token }, { status: { $eq: 0 } }] });
            if (merchantstore != null) {
                let user = await merchantcategory.findOne({ $and: [{ clientapikey: merchantstore.clientapikey }, { categoryid: "306d04e5ccf554ffcaebe1b929a6dbc27bc04a3b" }, { status: 1 }] });

                if (user != null) {
                    next()
                }
                else {
                    res.json({ status: 400, data: {}, message: "This Store has not access." })
                }
            }
            else {
                res.json({ status: 400, data: {}, message: "This Store has not access." })
            }
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async check_Store_Device_Access(req, res, next) {
        try {
            let token           = req.headers.authorization;
            let devicetoken     = req.headers.devicetoken;
            let merchantstore   = await merchantstores.findOne({ $and: [{ storeapikey: token }, { status: { $eq: 0 } }] });
            let storeDevice     = await storeDevices.findOne({ $and: [{ storeapikey: token }, { devicetoken: devicetoken }, { status: { $eq: 1 } }] });
            let client          = await clients.findOne({  api_key: merchantstore.clientapikey , disablestatus : true });
            if (merchantstore != null && storeDevice != null && client == null) 
            {
                next()
            }
            else if (client != null) 
            {
                return res.json({ status: 400, data: {}, message: "Your Account is disabled. Please Contact Admin" })
            }
            else 
            {
                return   res.json({ status: 400, data: {}, message: "This device could not identify. Please regsiter this device" })
            }
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "This device could not identify. Please regsiter this device" })
        }
    },
    async paylink_have_access(req, res, next) {
        try {
            let token = req.headers.authorization;
            let client      = await clients.findOne({  api_key: token , disablestatus : true });
            let user = await merchantcategory.findOne({ clientapikey: token, categoryid: "b7d272aa12e19c8add57354239645c6788e2e1a9", status: 1 });
            if (user != null && client == null) {
                next()
            }

            else if (client != null ) {
                return res.json({ status: 400, data: {}, message: "Your Account is disabled." })
            }
            else {
                return  res.json({ status: 400, data: {}, message: "You have not access to this service. Please apply for this service" })
            }
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "You have not access to this service. Please apply for this service" })
        }
    },
    async public_paylink_access(req, res, next) {
        try {
            let paymentId = req.body.paymentId;
            let pylinktranslog = await payLink.findOne({ id: paymentId });
            if (pylinktranslog == null) {
                return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }

            let invoiceData = await invoice.findOne({ id: pylinktranslog.invoice_id });

            if (invoiceData == null) {
                return res.json({ status: 400, data: {}, message: "Invalid Request " })
            }

            const duedate = new Date(invoiceData.duedate);
            const currentdate = new Date();
            if (duedate <= currentdate) {
                return res.json({ status: 400, data: {}, message: "Payment link is expired." })
            }
            let user = await merchantcategory.findOne({ clientapikey: invoiceData.merchantapikey, categoryid: "b7d272aa12e19c8add57354239645c6788e2e1a9", status: 1 });
            let client      = await clients.findOne({  api_key: invoiceData.merchantapikey , disablestatus : true });
            if (user != null && client == null) {
                next()
            }
            else if (client != null ) 
            {
                res.json({ status: 400, data: {}, message: "Your account is disabled" })
            }
            else {
                res.json({ status: 400, data: {}, message: "You have not access to this service. Please apply for this service" })
            }
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "You have not access to this service. Please apply for this service" })
        }
    },
    async public_fastpay_access(req, res, next) {
        try {
            let paymentId = req.body.fastCode;
            let pylinktranslog = await fastPaymentCode.findOne({ fastcodes: paymentId });

            if (pylinktranslog == null) {
                return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }
            let mercstore = await merchantstore.findOne({ id: pylinktranslog.storeid });
            if (mercstore == null) {
                return res.json({ status: 400, data: {}, message: "Invalid Request" })
            }

            let user = await merchantcategory.findOne({ clientapikey: mercstore.clientapikey, categoryid: "202449155183a71b5c0f620ebe4af26f8ce226f8", status: 1 });
            if (user != null) {
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "You have not access to this service. Please apply for this service" })
            }
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "You have not access to this service. Please apply for this service" })
        }
    },
    async fastpay_have_access(req, res, next) {
        try {

            let token = req.headers.authorization;

            let user        = await merchantcategory.findOne({ $and: [{ clientapikey: token }, { categoryid: "202449155183a71b5c0f620ebe4af26f8ce226f8" }, { status: 1 }] });
            let client      = await clients.findOne({  api_key : token , disablestatus : true });
            if (user != null && client == null) 
            {
                next()
            }
            else if(client != null){
                return res.json({ status: 400, data: {}, message: "Your account is disabled." })
            }
            else {
               return res.json({ status: 400, data: {}, message: "You have not access to this service. Please apply for this service" })
            }
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 401, data: {}, message: "You have not access to this service. Please apply for this service" })
        }
    },
    async verify_Public_Auth_Code(req, res, next) {
        try {
            let token = req.headers.token;
            let profile = jwt.verify(token, process.env.AUTH_KEY)
            req.user = profile
            next()
        }
        catch (error) {
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },


    async verify_variables(req, res, next) {
        try {
            const validationRule = {
                "invoiceNumber": "required|string",
                "customerName": "required|string",
                "email": "email",
                "mobileNumber": "required|string",
                "duedate": "date",
                "additionalNotes": "string",
                "payment_reason": "required|string",
                "currency": "required|string",
                "totalAmount": "required|numeric",
                "orderId": "required|string",
                "callbackURL": "required|string",
                "errorURL": "required|string",
                // "networkType": "required|string|exist:network,id",
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },

    async verify_forgotPassword(req, res, next) {
        try {
            const validationRule = {
                "email"         : "required|email",
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },

    async verify_checkTheTokenAndUpdate(req, res, next) {
        try {
            const validationRule = {
                "email"         : "required|email",
                "newpassword"   : "required|string|strict",
                "emailtoken"    : "required|string",
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },

    async verify_create_merchant_auth(req, res, next) {
        try {
            const validationRule = {
                "email"         : "required|email|exist",
                "password"      : "required|string|strict",
                "first_name"    : "required|string",
                "last_name"     : "required|string",
                 "type" : ['required', { 'in': ['Individual','Company'] }],
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_ResetPassword(req, res, next) {
        try {
            const validationRule = {
                "email"            : "required|email",
                "password"         : "required|string",
                "newpassword"      : "required|string|strict",
                
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_updateMerchantProfileImage(req, res, next) {
        try {
            const validationRule = {
                "profileimage"        : "required|string",
                "companyname"         : "required|string",
               
                
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_Login(req, res, next) {
        try {
            const validationRule = {
                "email"         : "required|email",
                "password"      : "required|string",
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_MerchantAuth(req, res, next) {
        try {
            const validationRule = {
                "email"         : "required|email",
                "code"          : "required|string",
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_getclientkey(req, res, next) {
        try {
            const validationRule = { "email"  : "required|email" };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_withdraw(req, res, next) {
        try {
            const validationRule = { 
                
                "network_id"  : "required|string", 
                "amount"      : "required|decimal",
                "address_to"  : "required|string" 
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_trans_by_network_id(req, res, next) {
        try {
            const validationRule = 
            { 
                "networkid"  : "required|string", 
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_resendingemail(req, res, next) {
        try {
            const validationRule = 
            { 
                "email"  : "required|email", 
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_createMerchantStore(req, res, next) {
        try {
            const validationRule = 
            { 
                "storename"  : "required|string",
               
               
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_updateMerchantStoreProfile(req, res, next) {
        try {
            const validationRule = 
            { 
                "storeprofile"  : "required|isBase64",
                "storename"     : "required|string",
                "storeaddress"  : "required|string",
                "storephone"    : "required|string",
               
               
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_updateMerchantStoreProfile(req, res, next) {
        try {
            const validationRule = 
            { 
                "storeprofile"  : "required|string",
                "storename"     : "required|string",
                "storeaddress"  : "required|string",
                "storephone"    : "required|string",
               
               
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_verfiyemail(req, res, next) {
        try {
            const validationRule = 
            { 
                "email"         : "required|email", 
                "emailtoken"    : "required|string", 
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },

    async verify_signup_admin_api(req, res, next) {
        try {
            const validationRule = 
            { 
                "email"         : "required|email", 
                "password"      : "required|string|strict", 
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_admin_Login(req, res, next) {
        try {
            const validationRule = 
            { 
                "email"         : "required|email", 
                "password"      : "required|string", 
            };
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) {
                    res.status(200)
                        .send({
                            status: 400,
                            success: false,
                            message: 'Validation failed',
                            data: err
                        });
                } else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
    async verify_Verfiy_Google_Auth(req, res, next) {
        try {
            const validationRule = 
            { 
                "email"         : "required|email", 
                "code"          : "required|string", 
            };
            let authorization   = req.headers.authorization;
            let user            = await admins.findOne({ admin_api_key: authorization, status : true  });
            await Validator(req.body, validationRule, {}, (err, status) => {
                if (!status) 
                {
                res.status(200).send({status: 400,success: false,message: 'Validation failed',data: err});
                } 
                else if(user == null){
                res.status(200).send({status: 400,message: "Invalid User",data: {}});
                }
                else {
                    next();
                }
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },
}


