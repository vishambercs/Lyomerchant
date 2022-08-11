const poolWallet = require('../Models/poolWallet');
const network = require('../Models/network');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
var crypto = require("crypto");
require("dotenv").config()

module.exports =
{
    async create_Pool_Wallet(req, res) {
        try {
            let network_details = await network.findOne({ 'id': req.body.network_id })
            let account = await Utility.GetAddress(network_details.nodeUrl)
            const poolWalletItem = new poolWallet({ id : crypto.randomBytes(20).toString('hex'),network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
            poolWalletItem.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).
                catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async all_pool_wallet(req, res) {
        try {
            await poolWallet.aggregate([{
                $lookup: {
                    from: "networks", // collection to join
                    localField: "network_id",//field from the input documents
                    foreignField: "id",//field from the documents of the "from" collection
                    as: "walletNetwork"// output array field
                }
            },
            ]).then(async (data) => {

                res.json({ status: 200, message: "Pool Wallet", data: data })
            }).catch(error => {
                console.log("get_clients_data", error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_Pool_Wallet_100(req, res) {
        try {

            let network_details = await network.findOne({ 'id': req.body.network_id })
            for (let i = 0; i < 10; i++) 
            { 
            let account = await Utility.GetAddress(network_details.nodeUrl)
            const poolWalletItem = new poolWallet({ id : crypto.randomBytes(20).toString('hex'), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
            poolWalletItem.save().then(async (val) => {
                 console.log("val",i,val) 
                // res.json({ status: 200, message: "Successfully", data: val })
            }).catch(error => { 
                    console.log("val",error) 
                    // res.json({ status: 400, data: {}, message: error }) 
                
                })

          }
        res.json({ status: 200, message: "Successfully", data: {} })
    }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
   
    },
}