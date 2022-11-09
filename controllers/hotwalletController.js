const hotWallets                    = require('../Models/hotWallets');
const network                       = require('../Models/network');
const Utility                       = require('../common/Utility');
var mongoose                        = require('mongoose');
const Web3                          = require('web3');
const Tx                            = require('ethereumjs-tx')
const poolWallets                   = require('../Models/poolWallet');
const Constant                      = require('../common/Constant');
const manualHotWalletTransferLogs   = require('../Models/manualHotWalletTransferLogs');
require("dotenv").config()


async function get_Balance_of_Address(addressObject) {
    try {
        console.log("addressObject===========================", addressObject)
        if (addressObject[0].networkDetails[0].libarayType == "Tronweb") {
            const HttpProvider = TronWeb.providers.HttpProvider;
            const fullNode = new HttpProvider(addressObject[0].networkDetails[0].nodeUrl);
            const solidityNode = new HttpProvider(addressObject[0].networkDetails[0].nodeUrl);
            const eventServer = new HttpProvider(addressObject[0].networkDetails[0].nodeUrl);
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, addressObject[0].privateKey);
            let contract = await tronWeb.contract().at(addressObject[0].networkDetails[0].contractAddress);
            let result23 = await tronWeb.trx.getBalance(addressObject[0].address)
            let account_balance_in_ether = await tronWeb.trx.getBalance(addressObject[0].address)
            let result = await contract.balanceOf(addressObject[0].address).call();
            const { abi } = await tronWeb.trx.getContract(addressObject[0].networkDetails[0].contractAddress);
            const sendcontract = tronWeb.contract(abi.entrys, addressObject[0].networkDetails[0].contractAddress);
            var value = tronWeb.BigNumber(tronWeb.toDecimal("0x013e2550"));
            result = tronWeb.toBigNumber(result)
            result = tronWeb.toDecimal(result)
            result = tronWeb.fromSun(result)
            return { status: 200, "result": resultFormat, "token": result, "native": account_balance_in_ether, "message": "Success" }
        }
        else {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject[0].networkDetails[0].nodeUrl))
            const contract = new WEB3.eth.Contract(Constant.USDT_ABI, addressObject[0].networkDetails[0].contractAddress);
            const result = await contract.methods.balanceOf(addressObject[0].address).call();
            let account_balance = await WEB3.eth.getBalance(addressObject[0].address)
            let account_balance_in_ether = Web3.utils.fromWei(account_balance.toString(), 'ether')
            let decimals = await contract.methods.decimals().call();
            let resultFormat = result / (1 * 10 ** decimals)
            return { status: 200, "result": result, "token": resultFormat, "native": account_balance_in_ether, "message": "Success" }

        }
    }
    catch (error) {
        console.log(error)
        return { status: 400, "token": null, "native": null, "message": "Error" }
    }
}

async function savelogs(poolWalletID, hotwalletID, trans_hash, status, remarks, created_by) {
    var manualLogs = new  manualHotWalletTransferLogs({
        id : mongoose.Types.ObjectId() , 
        poolWalletID : poolWalletID, 
        hotwalletID : hotwalletID , 
        trans_hash : trans_hash,
        status : status, 
        remarks : remarks, 
        created_by : created_by
    });
    let logs = await manualLogs.save().then(async (val) => {
        return JSON.stringify({ status: 200, message: "Added", data: val })
    }).catch(error => {
        console.log(error)
        return JSON.stringify({ status: 400, data: {}, message: error })
    })
    return logs;
}

async function savelogs(poolWalletID, hotwalletID, trans_hash, status, remarks, created_by) {
    var manualLogs = new  manualHotWalletTransferLogs({
        id              : mongoose.Types.ObjectId() , 
        poolWalletID    : poolWalletID, 
        hotwalletID     : hotwalletID , 
        trans_hash      : trans_hash,
        status          : status, 
        remarks         : remarks, 
        created_by      : created_by
    });
    let logs = await manualLogs.save().then(async (val) => {
        return JSON.stringify({ status: 200, message: "Added", data: val })
    }).catch(error => {
        console.log(error)
        return JSON.stringify({ status: 400, data: {}, message: error })
    })
    return logs;
}
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
            let hotwa = await  hotWallets.updateMany({network_id  : req.body.network_id} ,{$set:{status:0}}) 

            const hotWallet = new hotWallets({
                id          : mongoose.Types.ObjectId(),
                network_id  : req.body.network_id,
                address     : req.body.address,
                status      : req.body.status,
                created_by  : req.body.created_by,
            });
            hotWallet.save().then(async (val) => {
            res.json({ status: 200, message: "Successfully", data: val })
            }).catch(error => { res.json({ status: 400, data: {}, message: error }) })

        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async allHotWallets(req, res) {
        try {
            await hotWallets.aggregate([
                {$match : {status : 1}},
                {
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

            const hotWallet = await hotWallets.findOne({ "id": req.body.to_wallet_id })
            var web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].walletNetwork[0].nodeUrl));
            const contract = new web3.eth.Contract(Constant.USDT_ABI, from_wallet[0].walletNetwork[0].contractAddress, { from: from_wallet[0].address })
            let amount = web3.utils.toHex(Web3.utils.toWei("1"))
            const accounttransfer = contract.methods.transfer(hotWallet.address, amount).encodeABI();
            const nonce = await web3.eth.getTransactionCount(from_wallet[0].address, 'latest');
            // const transaction = { 'from': hotWallet.address, data: accounttransfer, value: 0, gas:  web3.utils.toHex(100000), gasPrice: 1000000108, 'nonce':  web3.utils.toHex(nonce), };
            const transaction = {
                gas: web3.utils.toHex(100000),
                "to": hotWallet.address,
                "value": "0x00",
                "data": accounttransfer,
                "from": from_wallet[0].address
            }

            const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privateKey);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                if (!error) {
                    res.json({ status: 200, message: "Pool Wallet", data: hash })

                } else {
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
                    $set:
                    {
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
    async manualHotWalletTranscation(req, res) {
        let from_wallet = {} ;
        let response = {}
        let hotWallet = {};
        let created_by = 0
        try {
            created_by = req.body.created_by
            from_wallet = await poolWallets.aggregate([
                { $match: { "id": req.body.id } },
                { $lookup: { from: "networks", localField: "network_id", foreignField: "id", as: "networkDetails" } },
            ])
            hotWallet = await hotWallets.findOne({ "network_id": from_wallet[0].network_id, "status": 1 })
            let balanceAddress = await get_Balance_of_Address(from_wallet)
            if (hotWallet != null && balanceAddress.status == 200) 
            {
                if (from_wallet[0].networkDetails[0].libarayType == "Web3") {
                    var web3 = new Web3(new Web3.providers.HttpProvider(from_wallet[0].networkDetails[0].nodeUrl));
                    const contract = new web3.eth.Contract(Constant.USDT_ABI, from_wallet[0].networkDetails[0].contractAddress, { from: from_wallet[0].address })
                    let decimals = await contract.methods.decimals().call();
                    let amount = balanceAddress.result;
                    amount = web3.utils.numberToHex(amount);
                    const accounttransfer = contract.methods.transfer(hotWallet.address, amount).encodeABI();
                    const nonce = await web3.eth.getTransactionCount(from_wallet[0].address, 'latest');
                    const transaction = { gas: web3.utils.toHex(req.body.gas), "to": from_wallet[0].networkDetails[0].contractAddress, "value": "0x00", "data": accounttransfer, "from": from_wallet[0].address }
                    const signedTx = await web3.eth.accounts.signTransaction(transaction, from_wallet[0].privateKey);
                    await web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('transactionHash', async function (hash) 
                    {
                        await savelogs(from_wallet[0].id, hotWallet.id, hash, 200, "done", created_by) 
                        const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , { $set:{ balance : 0 }})
                        response = { status: 200, message: "Success","poolWalletDetails" : from_wallet ,data: { "receipt": hash } }
                    }).on('receipt', async function (receipt) {
                            console.log(receipt)
                            const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , { $set:{ balance : 0 }})
                            await savelogs(from_wallet[0].id, hotWallet.id, receipt, 200, "done", created_by) 
                            response = { status: 200, message: "Success", "poolWalletDetails" : from_wallet , data: { "receipt": receipt } }
                        }).on('confirmation', async function (confirmationNumber, receipt) {
                            console.log(confirmationNumber, receipt)
                            await savelogs(from_wallet[0].id, hotWallet.id, receipt, 200, "done", created_by) 
                            const poolWallet = await poolWallets.updateOne({id : from_wallet[0].id } , { $set:{ balance : 0 }})
                            response = { status: 200, message: "Success","poolWalletDetails" : from_wallet, data: { "confirmationNumber": confirmationNumber, "receipt": receipt } }
                        })
                        .on('error', async function (error) {
                            console.log(error)
                            await savelogs(from_wallet[0].id, hotWallet.id, " ", 400,error, created_by) 
                            response = { status: 400, message: error, data: {},"poolWalletDetails" : from_wallet, }
                        });
               
                }
                else {
                    const HttpProvider  = TronWeb.providers.HttpProvider;
                    const fullNode      = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                    const solidityNode  = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                    const eventServer   = new HttpProvider(from_wallet[0].networkDetails[0].nodeUrl);
                    const tronWeb       = new TronWeb(fullNode, solidityNode, eventServer, from_wallet[0].privateKey);
                    let contract        = await tronWeb.contract().at(from_wallet[0].networkDetails[0].contractAddress);
                    let result          = await contract.transfer(hotWallet.address, result).send({ feeLimit: req.body.gas })
                    const poolWallet    = await poolWallets.updateOne({id : from_wallet[0].id } , { $set:{ balance : 0 }})
                    await savelogs(from_wallet[0].id, hotWallet.id,result, 200,"Done", created_by)
                    response = { status: 200, message: "success", data: result ,"poolWalletDetails" : from_wallet }
                }
                res.json(response)
            }
            else 
            {
                await savelogs(" ", " "," ", 400,"Network is not supported", created_by)
                res.json({ status: 400, message: "Network is not supported", data: null })
            }

        }
        catch (error) {
            console.log("Message %s sent: %s", error);
            await savelogs(req.body.id, " ",error, 400,error, created_by)
            res.json({ status: 400, data: {}, message: error.message,"poolWalletDetails" : from_wallet  })
        }
    },
}