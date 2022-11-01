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
                    pricemargin     : req.body.pricemargin,
                }
                }).then(async (val) => {
                if (val != null) {

                    res.json({ status: 200, message: "Not Found the Data", data: val })
                }
                else 
                {
                    const perferedNetworkItem = new perferedNetwork({
                        id              : mongoose.Types.ObjectId(),
                        clientapikey    : req.headers.authorization,
                        pricemargin     : req.body.pricemargin,
                        networkid       : req.body.networkid,
                        status          : req.body.status,
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
            let networksDetails = await perferedNetwork.aggregate
            ([
                { $match: { clientapikey: req.headers.authorization, } },
                { $lookup: { from: "networks", localField: "networkid", foreignField: "id", as: "networkDetails" } },
                {
                    "$project":
                    {
                         "clientapikey": 0,
                         "networkDetails.__v"            : 0,
                         "networkDetails.nodeUrl"        : 0,
                         "networkDetails.withdrawflag"   : 0,
                         "networkDetails.withdrawfee"    : 0,
                         "networkDetails.fixedfee"           : 0,
                         "networkDetails.native_currency_id": 0,
                         "networkDetails.kyt_network_id": 0,
                         "networkDetails.created_by": 0,
                         "networkDetails.libarayType": 0,
                         "networkDetails.contractAddress": 0,
                         "networkDetails.contractABI": 0,
                         "networkDetails.apiKey": 0,
                         "networkDetails.transcationurl": 0,
                         "networkDetails.scanurl": 0,
                         "networkDetails.status": 0,
                         "networkDetails.gaspriceurl": 0,
                         "networkDetails.latest_block_number": 0,
                         "networkDetails.processingfee": 0,
                         "networkDetails.transferlimit": 0,
                         "networkDetails.deleted_by": 0,
                         "networkDetails.updatedAt": 0,
                         "networkDetails.updatedAt": 0,
                         "networkDetails.hotwallettranscationstatus": 0,
                         "networkDetails.hotwallettranscationstatus": 0,
                         "networkDetails._id": 0
                    }
                }

            ])
            res.json({ status: 200, data: networksDetails, message: "Successfully" })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
}
