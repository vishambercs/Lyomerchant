const perferedNetwork = require('../../Models/perferedNetwork');
var mongoose = require('mongoose');
require("dotenv").config()

module.exports =
{
    async create_perfered_Network(req, res) {
        try {
            await perferedNetwork.findOneAndUpdate(
                {
                    clientapikey: req.headers.authorization,
                    networkid: req.body.networkid,
                }, {
                $set:
                {
                    status: req.body.status,
                }
                }).then(async (val) => {
                if (val != null) {

                    res.json({ status: 200, message: "Not Found the Data", data: val })
                }
                else 
                {
                    const perferedNetworkItem = new perferedNetwork({
                        id: mongoose.Types.ObjectId(),
                        clientapikey: req.headers.authorization,
                        networkid: req.body.networkid,
                        status: req.body.status,
                    });
                    let perfered_network = await perferedNetworkItem.save()
                    res.json({ status: 200, message: "Not Found the Data", data: perfered_network })
                }
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async get_perfered_Network(req, res) {
        try {
            let networksDetails = await perferedNetwork.aggregate([
                { $match: { clientapikey: req.headers.authorization, } },
                { $lookup: { from: "networks", localField: "networkid", foreignField: "id", as: "networkDetails" } },
            ])
            res.json({ status: 200, data: networksDetails, message: "Successfully" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}
