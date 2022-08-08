const client = require('../Models/clients');
require("dotenv").config()
module.exports =
{
    async Verfiy_Merchant(req, res, next) {
        try {
            let token = req.headers.authorization;
            client.find({ 'api_key': token , status : true}).then(val => {
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