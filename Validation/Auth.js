const client = require('../Models/clients');
const Validator = require('./index');
require("dotenv").config()
module.exports =
{
    async Verfiy_Merchant(req, res, next) {
        try {
            let api_key = req.headers.authorization;
            let token   = req.headers.token;
            console.log(req.headers.authorization,req.headers.token)
            client.find({ 'token': token ,'api_key': api_key , status : true}).then(val => {
                next()
            }).catch(error => {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            })

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async Verfiy_Kyc_Header(req, res, next) {
        try {
            console.log("Verfiy_Kyc_Header ===========",req.body)
            if (process.env.KYC_HEADER_AUTH == req.headers.auth) 
            {
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
                "networkType"   : "required|string",
                "callbackURL"   : "required|string",
                "securityHash"  : "required|string",
                "orderid"       : "required|string",
                "token"         : "required|string",
                "currency"      : "required|string",
                "amount"        : "required|decimal",
                "categoryid"    : "required|string",
            }
            Validator(req.body, validationRule, {}, (err, status) => 
            {
                if (!status) 
                {
                    res.status(412).send({ status: 412,message: 'Validation failed', data: err });
                }
                // else if(){

                // } 
                else 
                {
                    next();
                }
            });
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: error.message })
        }
    },
}