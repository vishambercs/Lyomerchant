const hotWallets = require('../Models/hotWallets');
const network = require('../Models/network');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
require("dotenv").config()
const Web3 = require('web3');
const poolWallets = require('../Models/poolWallet');
module.exports =
{
    async createHotWallets(req, res) {
        try {
            const networkDetail = await network.findOne({ "id": req.body.network_id })
            let account = await Utility.GetAddress(networkDetail.nodeUrl)
            const hotWallet = new hotWallets({ id: mongoose.Types.ObjectId(), network_id: req.body.network_id, address: account.address, privateKey: account.privateKey, });
            hotWallet.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).
                catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async createHotWalletsAPI(req, res) {
        try {
            const hotWallet = new hotWallets({
                id: mongoose.Types.ObjectId(),
                network_id: req.body.network_id,
                address: req.body.address,
                privateKey: req.body.privateKey,
                status: req.body.status,
                created_by: req.body.created_by,
            });
            hotWallet.save().then(async (val) => {
                res.json({ status: 200, message: "Successfully", data: val })
            }).
                catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async allHotWallets(req, res) {
        try {
            await hotWallets.aggregate([{
                $lookup: {
                    from: "networks", // collection to join
                    localField: "network_id",//field from the input documents
                    foreignField: "id",//field from the documents of the "from" collection
                    as: "NetworkDetails"// output array field
                }
            },
            ]).then(async (data) => {

                res.json({ status: 200, message: "Hot Wallets", data: data })
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
    async hotwalletTranscation(req, res) {
        try {

            const from_wallet = await poolWallets.aggregate([
                { $match:  { "id": req.body.from_wallet_id } },
                { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "walletNetwork" } },
            ])
            const hotWallet = await hotWallets.findOne({ "id": req.body.to_wallet_id })
            var web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].walletNetwork[0].nodeUrl));
            const nonce = await web3.eth.getTransactionCount(from_wallet[0].address, 'latest');
            const transaction = { 'to': hotWallet.address, 'value': 100, 'gas': 30000, 'maxPriorityFeePerGas': 1000000108, 'nonce': nonce, };
            const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privateKey);

            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                if (!error) 
                {
                    res.json({ status: 200, message: "Pool Wallet", data: hash })

                } else 
                {
                    console.log("❗Something went wrong while submitting your transaction:", error)
                    res.json({ status: 200, message: "Pool Wallet", data: error })
                   
                }
            })
         }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async deleteHotWallets(req, res) {
        try {
            hotWallets.findOneAndUpdate({ id: req.body.id },
                {
                    $set: {
                        deleted_by: req.body.deleted_by,
                        status: 0,
                        deleted_at: Date.now(),
                    }
                }, { $new: true }).then(async (val) => {
                    res.json({ status: 200, message: "Successfully", data: val })
                }).
                catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async updateHotWallets(req, res) {
        try {
        await hotWallets.findOneAndUpdate({ id: req.body.id },
                {$set: {
                        network_id: req.body.network_id,
                        address: req.body.address,
                        privateKey: req.body.privateKey,
                        status: req.body.status,
                        created_by: req.body.created_by
                    }
                }, { $new: true }).then(async (val) => {
                    res.json({ status: 200, message: "Successfully", data: val })
                }).
                catch(error => { res.json({ status: 400, data: {}, message: error }) })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async requestWithdraw(req, res) {
        try {
        await hotWallets.findOneAndUpdate({ id: req.body.id },
                {$set: {
                        network_id: req.body.network_id,
                        address: req.body.address,
                        privateKey: req.body.privateKey,
                        status: req.body.status,
                        created_by: req.body.created_by
                    }
                }, { $new: true }).then(async (val) => {
                    res.json({ status: 200, message: "Successfully", data: val })
                }).
                catch(error => { res.json({ status: 400, data: {}, message: error }) })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
}