const client = require('../Models/clients');
require("dotenv").config()
module.exports =
{
    async Verfiy_Merchant(req, res, next) {
        try {
            let api_key = req.headers.authorization;
            let token   = req.headers.token;
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
}