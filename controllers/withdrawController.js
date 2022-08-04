const withdrawLogs  = require('../Models/withdrawLog');
const cornJobs      = require('../common/cornJobs');
const networks      = require('../Models/network');
var CryptoJS        = require('crypto-js')
var crypto          = require("crypto");
var Utility         = require('../common/Utility');
const bcrypt        = require('bcrypt');
const Web3          = require('web3');
var crypto          = require("crypto");
const clientWallets = require('../Models/clientWallets');

require("dotenv").config()

module.exports =
{
    async save_withdraw(req, res) 
    {
        try 
        {
            const network = await networks.findOne({id:req.body.network_id})
            if(network != null )
            {
            let transfer_fee  = ((parseFloat(req.body.amount)/10000) + network.processingfee) * 0.03
            const withdrawLog = new withdrawLogs({ 
                id                : crypto.randomBytes(20).toString('hex'),
                api_key           : req.headers.authorization, 
                network_id        : req.body.network_id, 
                amount            : req.body.amount, 
                fee               : transfer_fee,
                address_to        : req.body.address_to,
                address_from      : " ",
                transcation_hash  : " ",
                status            : 0  
            });
            withdrawLog.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).catch(
                error => { res.json({ status: 400, data: {}, message: error }) 
            })
        }
        else
        {
            res.json({ status: 400, data: {}, message: "Unsupported Network " }) 
        }
        }
        catch (error) 
        {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async update_withdraw_request(req, res) {
        try {
            await withdrawLogs.findOneAndUpdate(
                {id : req.body.id } , 
                { $set: 
                { 
                    remarks             : req.body.remarks,
                    status              : req.body.status, 
                    address_from        : req.body.address_from, 
                    transcation_hash    : req.body.transcation_hash 
                }}, { $new:true } ).then(async (withdraw) => 
            {
                if(req.body.status == 1)
                {
                let val                                         = await clientWallets.findOne({ api_key: withdraw.api_key, network_id:  withdraw.network_id })
                let clientWallet                                = await clientWallets.updateOne({ api_key: withdraw.api_key, network_id: withdraw.network_id  } ,{ $set: { balance: (val.balance - withdraw.amount ) } } )
                }
                res.json({ status: 200, message: "Successfully", data: withdraw })
            }).catch(
                error => { res.json({ status: 400, data: {}, message: error }) 
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    
    async get_client_wihdraw(req, res) {
        try {
            await withdrawLogs.aggregate( 
                [
                    { $match: { api_key: req.headers.authorization } },
                    {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project": {
                            "networkDetails.__v": 0,
                            "networkDetails.id": 0,
                            "networkDetails.nodeUrl": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
           
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_client_wihdraw_total(req, res) {
        try {
            await withdrawLogs.aggregate( 
                [
                    {  $group: { _id: '$network_id', total: { $sum: '$amount' }} },
                     { $lookup: {from: "networks", localField: "_id",foreignField: "id",as: "networkDetails"}},
                ]).then(async (data) => {
                    res.json({ status: 200, message: "Withdraw Pool", data: data })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
           
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },

}