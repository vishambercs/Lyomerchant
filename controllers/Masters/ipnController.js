const IPNS = require('../../Models/IPN');
var mongoose = require('mongoose');

module.exports =
{
    async create_IPN_Link(req, res) {
        try {
            await IPNS.updateMany(
                { client_api_key: req.headers.authorization } , 
                { $set: { status: 0, updated_by : req.headers.authorization,updated_at:new Date().toString() } },
               
            )
            const IPN = new IPNS({
                id: mongoose.Types.ObjectId(),
                client_api_key: req.headers.authorization,
                ipn_url: req.body.ipn_url,
                client_api_token : req.body.ipn_secret_key,
                status: 1,
                created_by: req.headers.authorization,
                created_at: new Date().toString(),
            });
            let responnse = await IPN.save().then(async (val) => {
                return { status: 200, message: "Successfully", data: val }
            }).catch(error => {
                console.log(error)
                return { status: 400, data: {}, message: error }
            })
            res.json({ status: 200, data: responnse, message: "message" })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async get_IPN_Link(req, res) {
        try {
            let IPN = await IPNS.findOne({ client_api_key: req.headers.authorization,status: 1 } )
            let dataArray = {}
           
         if(IPN != null){
                dataArray = {"ipn_url" :IPN.ipn_url  }
            }
            res.json({ status: 200, data: dataArray, message: "message" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}

