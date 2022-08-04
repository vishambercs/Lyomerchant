const client = require('../Models/clients');

module.exports =
{
    async Verfiy_Merchant(req, res, next) {
        try {
            let token = req.headers.authorization;
            client.find({ 'api_key': token }).then(val => 
            {
                next()
            }).catch(error => 
            {
                res.json({ status: 400, data: {}, message: "Unauthorize Access" })
            })

        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
}