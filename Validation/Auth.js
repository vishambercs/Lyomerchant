const client = require('../Models/clients');
const admins = require('../Models/admin');
const merchantstores = require('../Models/merchantstore');
const merchantcategory = require('../Models/merchantcategory');
const storeDevices = require('../Models/storeDevices');
const Validator = require('./index');
const jwt = require('jsonwebtoken');
require("dotenv").config()
module.exports =
{
    async Verfiy_Merchant(req, res, next) {
        try {
            let api_key = req.headers.authorization;
            let token = req.headers.token;
            client.find({ 'token': token, 'api_key': api_key, status: true }).then(val => {
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
            let user = await admins.findOne({ admin_api_key: authorization, token: token });
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
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
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
    async is_merchant(req, res, next) {
        try {
            let token = req.headers.token;
            let authorization = req.headers.authorization;
            let user = await client.findOne({ api_key: authorization, authtoken: token });
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
    async has_Pos_Access(req, res, next) {
        try {
            let token = req.headers.authorization;
            let user = await merchantcategory.findOne({ $and: [{ clientapikey: token }, { categoryid: "306d04e5ccf554ffcaebe1b929a6dbc27bc04a3b" }, { status: 1 }] });
            if (user != null) {
                next()
            }
            else {
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
            let token = req.headers.authorization;
            let devicetoken = req.headers.devicetoken;
            let merchantstore = await merchantstores.findOne({ $and: [{ storeapikey: token }, { status: { $eq: 0 } }] });
            let storeDevice = await storeDevices.findOne({ $and: [{ storeapikey: token }, { devicetoken: devicetoken }, { status: { $eq: 1 } }] });
            if (merchantstore != null && storeDevice != null) 
            {
                next()
            }
            else {
                res.json({ status: 400, data: {}, message: "This device could not identify. Please regsiter this device" })
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
            let user = await merchantcategory.findOne({ $and: [{ clientapikey: token }, { categoryid: "b7d272aa12e19c8add57354239645c6788e2e1a9" }, { status: 1 }] });
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
            console.log("token", token)
            let user = await merchantcategory.findOne({ $and: [{ clientapikey: token }, { categoryid: "202449155183a71b5c0f620ebe4af26f8ce226f8" }, { status: 1 }] });
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
    async verify_Public_Auth_Code(req, res, next) {
        try 
        {
            let token = req.headers.token;
            let profile = jwt.verify(token, process.env.AUTH_KEY)
            req.user = profile
            next()
        }
        catch (error) {
            res.json({ status: 401, data: {}, message: "Unauthorize Access" })
        }
    },

}


