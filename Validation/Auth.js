const client = require('../Models/clients');
require("dotenv").config()
module.exports =
{
    async Verfiy_Merchant(req, res, next) {
        try {
            let token = req.headers.authorization;
            client.find({ 'api_key': token }).then(val => {
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
         
            if (process.env.KYC_HEADER_AUTH == req.headers.secret_key) 
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