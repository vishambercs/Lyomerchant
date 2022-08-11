const hotWallets = require('../Models/hotWallets');
const network = require('../Models/network');
const Utility = require('../common/Utility');
var mongoose = require('mongoose');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx')
const poolWallets = require('../Models/poolWallet');
require("dotenv").config()

module.exports =
{
    async createHotWallets(req, res) {
        try {
            const networkDetail = await network.findOne({ "id": req.body.network_id })
            let account = await Utility.GetAddress(networkDetail.nodeUrl)
            const hotWallet = new hotWallets({ id: mongoose.Types.ObjectId(), network_id: req.body.network_id, address: account.address, });
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

            const from_wallet = await poolWallets.aggregate(
                [
                    { $match: { "id": req.body.from_wallet_id } },
                    { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "walletNetwork" } },
                ])
            // let abi = [
            //     {
            //         "inputs": [
            //             {
            //                 "internalType": "uint256",
            //                 "name": "chainId_",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "constructor"
            //     },
            //     {
            //         "anonymous": false,
            //         "inputs": [
            //             {
            //                 "indexed": true,
            //                 "internalType": "address",
            //                 "name": "src",
            //                 "type": "address"
            //             },
            //             {
            //                 "indexed": true,
            //                 "internalType": "address",
            //                 "name": "guy",
            //                 "type": "address"
            //             },
            //             {
            //                 "indexed": false,
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "Approval",
            //         "type": "event"
            //     },
            //     {
            //         "anonymous": true,
            //         "inputs": [
            //             {
            //                 "indexed": true,
            //                 "internalType": "bytes4",
            //                 "name": "sig",
            //                 "type": "bytes4"
            //             },
            //             {
            //                 "indexed": true,
            //                 "internalType": "address",
            //                 "name": "usr",
            //                 "type": "address"
            //             },
            //             {
            //                 "indexed": true,
            //                 "internalType": "bytes32",
            //                 "name": "arg1",
            //                 "type": "bytes32"
            //             },
            //             {
            //                 "indexed": true,
            //                 "internalType": "bytes32",
            //                 "name": "arg2",
            //                 "type": "bytes32"
            //             },
            //             {
            //                 "indexed": false,
            //                 "internalType": "bytes",
            //                 "name": "data",
            //                 "type": "bytes"
            //             }
            //         ],
            //         "name": "LogNote",
            //         "type": "event"
            //     },
            //     {
            //         "anonymous": false,
            //         "inputs": [
            //             {
            //                 "indexed": true,
            //                 "internalType": "address",
            //                 "name": "src",
            //                 "type": "address"
            //             },
            //             {
            //                 "indexed": true,
            //                 "internalType": "address",
            //                 "name": "dst",
            //                 "type": "address"
            //             },
            //             {
            //                 "indexed": false,
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "Transfer",
            //         "type": "event"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [],
            //         "name": "DOMAIN_SEPARATOR",
            //         "outputs": [
            //             {
            //                 "internalType": "bytes32",
            //                 "name": "",
            //                 "type": "bytes32"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [],
            //         "name": "PERMIT_TYPEHASH",
            //         "outputs": [
            //             {
            //                 "internalType": "bytes32",
            //                 "name": "",
            //                 "type": "bytes32"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "address",
            //                 "name": "",
            //                 "type": "address"
            //             }
            //         ],
            //         "name": "allowance",
            //         "outputs": [
            //             {
            //                 "internalType": "uint256",
            //                 "name": "",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "usr",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "approve",
            //         "outputs": [
            //             {
            //                 "internalType": "bool",
            //                 "name": "",
            //                 "type": "bool"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "",
            //                 "type": "address"
            //             }
            //         ],
            //         "name": "balanceOf",
            //         "outputs": [
            //             {
            //                 "internalType": "uint256",
            //                 "name": "",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "usr",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "burn",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [],
            //         "name": "decimals",
            //         "outputs": [
            //             {
            //                 "internalType": "uint8",
            //                 "name": "",
            //                 "type": "uint8"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "guy",
            //                 "type": "address"
            //             }
            //         ],
            //         "name": "deny",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "usr",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "mint",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "src",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "address",
            //                 "name": "dst",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "move",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [],
            //         "name": "name",
            //         "outputs": [
            //             {
            //                 "internalType": "string",
            //                 "name": "",
            //                 "type": "string"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "",
            //                 "type": "address"
            //             }
            //         ],
            //         "name": "nonces",
            //         "outputs": [
            //             {
            //                 "internalType": "uint256",
            //                 "name": "",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "holder",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "address",
            //                 "name": "spender",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "nonce",
            //                 "type": "uint256"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "expiry",
            //                 "type": "uint256"
            //             },
            //             {
            //                 "internalType": "bool",
            //                 "name": "allowed",
            //                 "type": "bool"
            //             },
            //             {
            //                 "internalType": "uint8",
            //                 "name": "v",
            //                 "type": "uint8"
            //             },
            //             {
            //                 "internalType": "bytes32",
            //                 "name": "r",
            //                 "type": "bytes32"
            //             },
            //             {
            //                 "internalType": "bytes32",
            //                 "name": "s",
            //                 "type": "bytes32"
            //             }
            //         ],
            //         "name": "permit",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "usr",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "pull",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "usr",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "push",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "guy",
            //                 "type": "address"
            //             }
            //         ],
            //         "name": "rely",
            //         "outputs": [],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [],
            //         "name": "symbol",
            //         "outputs": [
            //             {
            //                 "internalType": "string",
            //                 "name": "",
            //                 "type": "string"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [],
            //         "name": "totalSupply",
            //         "outputs": [
            //             {
            //                 "internalType": "uint256",
            //                 "name": "",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "dst",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "transfer",
            //         "outputs": [
            //             {
            //                 "internalType": "bool",
            //                 "name": "",
            //                 "type": "bool"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": false,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "src",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "address",
            //                 "name": "dst",
            //                 "type": "address"
            //             },
            //             {
            //                 "internalType": "uint256",
            //                 "name": "wad",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "name": "transferFrom",
            //         "outputs": [
            //             {
            //                 "internalType": "bool",
            //                 "name": "",
            //                 "type": "bool"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "nonpayable",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [],
            //         "name": "version",
            //         "outputs": [
            //             {
            //                 "internalType": "string",
            //                 "name": "",
            //                 "type": "string"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     },
            //     {
            //         "constant": true,
            //         "inputs": [
            //             {
            //                 "internalType": "address",
            //                 "name": "",
            //                 "type": "address"
            //             }
            //         ],
            //         "name": "wards",
            //         "outputs": [
            //             {
            //                 "internalType": "uint256",
            //                 "name": "",
            //                 "type": "uint256"
            //             }
            //         ],
            //         "payable": false,
            //         "stateMutability": "view",
            //         "type": "function"
            //     }
            // ];

            let abi = [
              
                {
                    "constant": false,
                    "inputs": [
                        {
                            "name": "_to",
                            "type": "address"
                        },
                        {
                            "name": "_value",
                            "type": "uint256"
                        }
                    ],
                    "name": "transfer",
                    "outputs": [
                        {
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "type": "function"
                }
            ];
           
            const hotWallet = await hotWallets.findOne({ "id": req.body.to_wallet_id })
            var web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].walletNetwork[0].nodeUrl));
            const contract = new web3.eth.Contract(abi, from_wallet[0].walletNetwork[0].contractAddress, {from: from_wallet[0].address})
            let amount =  web3.utils.toHex(Web3.utils.toWei("1"))
            const accounttransfer = contract.methods.transfer(hotWallet.address, amount).encodeABI();
            const nonce = await web3.eth.getTransactionCount(from_wallet[0].address, 'latest');
            // const transaction = { 'from': hotWallet.address, data: accounttransfer, value: 0, gas:  web3.utils.toHex(100000), gasPrice: 1000000108, 'nonce':  web3.utils.toHex(nonce), };
            const transaction = {   
            gas: web3.utils.toHex(100000),
            "to": hotWallet.address ,
            "value": "0x00",
            "data": accounttransfer,
            "from": from_wallet[0].address
            }
            
            const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privateKey);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) 
            {
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
                {
                    $set: {
                        network_id: req.body.network_id,
                        address: req.body.address,

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
                {
                    $set: {
                        network_id: req.body.network_id,
                        address: req.body.address,

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