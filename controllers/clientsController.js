const clients = require('../Models/clients');
const kycWebHookLogs = require('../Models/kycWebHookLog');
const transcationLog = require('../Models/transcationLog');
const cornJobs = require('../common/cornJobs');
var CryptoJS = require('crypto-js')
var crypto = require("crypto");
var Utility = require('../common/Utility');
var constant = require('../common/Constant');
var commonFunction = require('../common/commonFunction');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const clientWallets = require('../Models/clientWallets');
const poolWallet = require('../Models/poolWallet');
const transactionPools = require('../Models/transactionPool');
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const network = require('../Models/network');
var mongoose = require('mongoose');
const axios = require('axios')
var stringify = require('json-stringify-safe');
const Constant = require('../common/Constant');
var otpGenerator = require('otp-generator')
const TronWeb = require('tronweb')
require("dotenv").config()

module.exports =
{
    async create_clients(req, res) {
        try {
            var api_key = crypto.randomBytes(20).toString('hex');
            var email = req.body.email
            var hash = CryptoJS.MD5(email + process.env.BASE_WORD_FOR_HASH).toString();
            if (hash == req.body.hash) {
                const client = new clients({ status: false, api_key: api_key, email: req.body.email, });
                const previous_client = await clients.findOne({ 'email': email }).then(async (val) => {
                    if (val == null) {
                        res.json({ status: 200, message: "Clients Data", data: {} })
                    }
                    else {
                        res.json({ status: 200, message: "Clients Data", data: { id: val._id, token: val.token, api_key: val.api_key, email: val.email } })
                    }
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
            }
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Verification Failed" })
        }

    },
    async updateClientToken(req, res) {
        var token = crypto.randomBytes(20).toString('hex');
        var hash = CryptoJS.MD5(req.body.email + req.headers.authorization + process.env.BASE_WORD_FOR_HASH).toString();
        if (hash == req.body.hash) {
            await clients.findOneAndUpdate({ email: req.body.email }, { $set: { "token": token } }, { $new: true }).then(async (val) => {
                if (val != null) {
                    res.json({ status: 200, message: "Verification Email Sent", data: { "email": val.email, "token": token } })
                }
                else {
                    res.json({ status: 400, message: "Invalid Email", data: null })
                }
            }).catch(error => {
                console.log('create_merchant ', error);
                res.json({ status: 400, data: {}, message: error.message })
            });
        }
        else {
            res.json({ status: 400, data: {}, message: "Invalid Hash" })
        }
    },
    async create_merchant(req, res) {
        var api_key = crypto.randomBytes(20).toString('hex');
        var email = req.body.email
        var password = req.body.password
        var hash = CryptoJS.MD5(email + password + process.env.BASE_WORD_FOR_HASH).toString();
        const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
        const password_hash = bcrypt.hashSync(password, salt);
        let secret = authenticator.generateSecret()
        var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        var token = crypto.randomBytes(20).toString('hex');

        if (hash == req.body.hash) {
            QRCode.toDataURL(authenticator.keyuri(req.body.email, process.env.GOOGLE_SECERT, secret)).then(async (url) => {
                const client = new clients({ token: token, loginstatus: false, emailtoken: otp, emailstatus: false, kycLink: " ", two_fa: false, secret: secret, qrcode: url, status: false, password: password_hash, api_key: api_key, email: req.body.email, hash: hash, });
                client.save().then(async (val) => {
                    var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": val.email, "subject": "Email Verfication Token", "templateData": { "password": otp } }
                    let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
                    res.json({ status: 200, message: "We sent token to your Email", data: val })
                }).catch(error => {
                    console.log(error)
                    res.json({ status: 400, data: {}, message: error })
                })
            }).catch(error => {
                console.log('create_merchant ', error);
                res.json({ status: 400, data: {}, message: error.message })
            });
        }
        else {
            res.json({ status: 400, data: {}, message: "Invalid Hash" })
        }
    },


    async resendingemail(req, res) {
        var email = req.body.email
        var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false })

        await clients.findOneAndUpdate({ email: req.body.email }, { $set: { "emailtoken": otp, "emailstatus": false, "loginstatus": false } }, { $new: true })
            .then(async (val) => {
                console.log("val otp", val)
                if (val != null) {
                    var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": val.email, "subject": "Email Verfication Token", "templateData": { "password": otp } }
                    let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
                    res.json({ status: 200, message: "Verification Email Sent", data: val.email })
                }
                else {
                    res.json({ status: 400, message: "Invalid Email", data: null })
                }
            })
            .catch(error => {
                console.log('create_merchant ', error);
                res.json({ status: 400, data: {}, message: error.message })
            });
    },
    async verfiyemail(req, res) {
        await clients.findOneAndUpdate({ email: req.body.email, emailtoken: req.body.emailtoken }, { $set: { "emailstatus": true, "loginstatus": true } })
            .then(async (val) => {
                if (val != null) {
                    let clientsdata = await clients.findOne({ email: req.body.email })
                    res.json({ status: 200, message: "Email Verification Successfully", data: clientsdata })
                }
                else {
                    res.json({ status: 400, message: "Invalid Token", data: null })
                }
            })
            .catch(error => {
                console.log('create_merchant ', error);
                res.json({ status: 400, data: {}, message: error.message })
            });
    },
    async Create_Kyc_Link(req, res) {
        try {
            await clients.findOne({ api_key: req.headers.authorization }).then(async (val) => {
                if (val != null) {
                    let kycurl = process.env.KYC_URL + Constant.kyc_path1 + val.api_key + Constant.kyc_path2
                    let kyc_link = null
                    let postRequests = await commonFunction.Post_Request(kycurl, { "levelName": "LMT_basic_level" }, { "Authorization": process.env.KYC_URL_TOKEN })
                    let json_response = JSON.parse(postRequests.data)
                    console.log("json_response", json_response)
                    if (json_response.status == 200) {
                        if (json_response.data.body.length != 0) {
                            let KYC_ID = json_response.data.body.kyc_link.split("/");
                            kyc_link = process.env.KYC_URL_APPROVE + KYC_ID[1];
                        }
                        await clients.findOneAndUpdate({ api_key: req.headers.authorization }, { $set: { "kycLink": kyc_link } }, { $new: true }).then(async (val) => {
                            res.json({ status: 200, message: "Client Added Successfully", data: { "kyclink": kyc_link, "apikey": req.headers.authorization } })
                        }).catch(error => {
                            console.log(error)
                            res.json({ status: 400, data: {}, message: error })
                        })
                    }
                    else {
                        res.json({ status: 400, message: "Invalid Request", data: {} })
                    }

                }
                else {
                    res.json({ status: 400, message: "Invalid Request", data: {} })
                }
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async get_clients_data(req, res) {
        try {
            let token = req.headers.authorization;
            clients.find({ 'api_key': token }).then(val => {
                res.json({ status: 200, message: "Clients Data", data: val })
            }).catch(error => {
                console.log("get_clients_data", error)
                // res.json({ "error": error })
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async Login(req, res) {
        try {
            let email = req.body.email;
            clients.findOne({ 'email': email }).select('+password').then(val => {
                var password_status = bcrypt.compareSync(req.body.password, val.password);
                if (val.emailstatus == false) {
                    res.json({ "status": 400, "data": {}, "message": "Please Verify Email First" })
                }
                else if (val.loginstatus == false) {
                    res.json({ "status": 400, "data": {}, "message": "Please contact with admin. Your account disabled" })
                }
                else if (password_status == true) {
                    val["api_key"] = ""
                    val["hash"] = ""
                    val["qrcode"] = val["two_fa"] == false ? val["qrcode"] : ""
                    res.json({ "status": 200, "data": val, "message": "Successfully Login" })
                }
                else if (password_status == false) {
                    res.json({ "status": 400, "data": {}, "message": "Email or Password is wrong" })
                }

            }).catch(error => {
                console.log("get_clients_data", error)
                // res.json({ "error": error })
                res.json({ status: 400, data: {}, message: "Email or Password is wrong" })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Email or Password is wrong" })
        }
    },
    async reset_merchant_two_fa(req, res) {
        try {

            await clients.findOneAndUpdate({ email: req.body.email }, { $set: { two_fa: false } }, { $new: true })
                .then(async (val) => {
                    if (val != null) {
                        let data = await clients.findOne({ 'email': req.body.email })
                        res.json({ status: 200, message: "Reset Two Fa", data: { "qrcode": val.qrcode, "secret": val.secret } })
                    }
                    else {
                        res.json({ status: 400, message: "Invalid Email", data: null })
                    }
                })
                .catch(error => {
                    console.log('create_merchant ', error);
                    res.json({ status: 400, data: {}, message: error.message })
                });


        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Email or Password is wrong" })
        }
    },

    async Verfiy_Google_Auth(req, res) {
        try {
            let email = req.body.email
            let code = req.body.code
            clients.findOne({ 'email': email }).then(async (val) => {
                if (authenticator.check(code, val.secret)) {
                    if (val.two_fa == false) {
                        let wallet = await clients.findOneAndUpdate({ 'email': email }, { $set: { two_fa: true } }, { $new: true })
                        let data = await clients.findOne({ 'email': email })
                        res.json({ "status": 200, "data": data, "message": "Get The Data Successfully" })
                    } else {
                        res.json({ "status": 200, "data": val, "message": "Get The Data Successfully" })
                    }

                } else {
                    res.json({ "status": 400, "data": {}, "message": "Verification Failed" })
                }
            }).catch(error => {
                console.log("get_clients_data", error)
                // res.json({ "error": error })
                res.json({ status: 400, data: {}, message: "Verification Failed" })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Verification Failed" })
        }
    },
    async get_BalancebyAddress(req, res) {
        try {
            let addressObject = await poolWallet.aggregate(
                [
                    { $match: { address: req.body.address } },

                    {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project":
                        {

                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ])
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
                res.json({ status: 200, data: account_balance_in_ether, "resp": result, "result23": result23, message: "Working" })
            }
            else {
                const WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject[0].networkDetails[0].nodeUrl))
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, addressObject[0].networkDetails[0].contractAddress);
                const result = await contract.methods.balanceOf(addressObject[0].address).call();
                const format = Web3.utils.fromWei(result);
                const toweiformat = result / 1e6
                let account_balance = await WEB3.eth.getBalance(addressObject[0].address)
                let account_balance_in_ether = Web3.utils.fromWei(account_balance.toString(), 'ether')
                let decimals = await contract.methods.decimals().call();
                let decimals_call = await contract.methods.decimals().call();
                console.log(result, decimals)
                console.log(result, decimals, result / (1 * 10 ** decimals))
                res.json({ status: 200, "value": value, data: account_balance_in_ether, result: result, "toweiformat": toweiformat, "format": format })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async update_cron_job(req, res) {
        try {
            let pooldata = await transactionPools.aggregate(
                [
                    { $match: { $or: [{ status: 0 }, { status: 2 }] } },
                    {
                        $lookup: {
                            from: "poolwallets", // collection to join
                            localField: "poolwalletID",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "poolWallet"// output array field
                        },
                    }, {
                        $lookup: {
                            from: "networks", // collection to join
                            localField: "poolWallet.network_id",//field from the input documents
                            foreignField: "id",//field from the documents of the "from" collection
                            as: "networkDetails"// output array field
                        }
                    },
                    {
                        "$project":
                        {
                            "poolWallet.privateKey": 0,
                            "poolWallet.id": 0,
                            "poolWallet._id": 0,
                            "poolWallet.status": 0,
                            "poolWallet.__v": 0,
                            "networkDetails.__v": 0,
                            "networkDetails.created_by": 0,
                            "networkDetails.createdAt": 0,
                            "networkDetails.updatedAt": 0,
                            "networkDetails._id": 0
                        }
                    }
                ])
            let addressObject = pooldata[0];
            if (addressObject.networkDetails[0].cointype == "Token") {
                const WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject.networkDetails[0].nodeUrl))
                let abi = [
                    {
                        constant: true,
                        inputs: [{ name: "_owner", type: "address" }],
                        name: "balanceOf",
                        outputs: [{ name: "balance", type: "uint256" }],
                        type: "function",
                    },
                ];
                const contract = new WEB3.eth.Contract(abi, addressObject.networkDetails[0].contractAddress);
                let result = await contract.methods.balanceOf(addressObject.poolWallet[0].address).call();
                const account_balance_in_ether = await WEB3.utils.fromWei(result.toString());
                var amountstatus = await commonFunction.amount_check(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), account_balance_in_ether)
                if (amountstatus != 0) {
                    let merchantbalance = account_balance_in_ether - addressObject.poolWallet[0].balance
                    await clientWallets.findOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id }).
                        then(async (val) => {
                            console.log("merchantbalance 4", val)
                            if (val != null) {
                                console.log("merchantbalance 2", val.balance)
                                let clientdetails = await clientWallets.updateOne({ id: val.id }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * 0.01))) } })
                                console.log("merchantbalance 3", clientdetails)
                            }
                        }).catch(error => {
                            console.log("get_clients_data", error)
                            res.json({ status: 400, data: {}, message: "Verification Failed" })
                        })
                    // "balance" :
                    let new_record = await transactionPools.updateOne({ 'id': addressObject.id }, { $set: { "status": amountstatus, "balance": (amountstatus == 0 || amountstatus == 1) ? 0 : (addressObject.amount - merchantbalance) } })
                    let new_record1 = await poolWallet.findOneAndUpdate({ id: addressObject.poolwalletID }, { $set: { status: ((amountstatus == 1 || amountstatus == 3) ? 0 : 1), balance: account_balance_in_ether } })
                    let get_transcation_response = await commonFunction.Get_Transcation_List(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
                    if (amountstatus != 0) {

                        let transcationHistory = await transcationLog.find({ 'trans_pool_id': addressObject.id })
                        let transactionPoolData = await transactionPools.find({ 'id': addressObject.id })
                        let parameters = { "remainbalance": transactionPoolData.balance, "transactionHistory": JSON.stringify(transcationHistory), "status": amountstatus, "token": transactionPoolData.clientToken, "orderid": transactionPoolData.orderid }
                        console.log("parameters", parameters)
                        let get_addressObject = await commonFunction.Post_Request(addressObject.callbackURL, parameters, {})
                        console.log("get_addressObject", get_addressObject)
                        // let get_addressObject    = await commonFunction.Post_Request(addressObject.callbackURL,parameters,headers) 

                        // let get_addressObject = await commonFunction.get_Request(addressObject.callbackURL)

                    }

                }
                // return JSON.stringify({ status: 200, data: account_balance_in_ether, message: "Done" })
                res.json({ status: 200, data: account_balance_in_ether, message: "Verification Failed" })
            }
            else if (addressObject.networkDetails[0].cointype == "Native") {

                const BSC_WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject.networkDetails[0].nodeUrl))
                let account_balance = await BSC_WEB3.eth.getBalance(addressObject.poolWallet[0].address.toLowerCase())
                let account_balance_in_ether = Web3.utils.fromWei(account_balance.toString(), 'ether')
                var amountstatus = await commonFunction.amount_check(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(account_balance_in_ether))
                if (amountstatus != 0) {
                    let merchantbalance = account_balance_in_ether - addressObject.poolWallet[0].balance
                    await clientWallets.findOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id }).
                        then(async (val) => {
                            if (val != null) {

                                console.log("merchantbalance 2", val.balance)
                                let clientdetails = await clientWallets.updateOne({ id: val.id }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * 0.01))) } })
                                console.log("merchantbalance 3", clientdetails)
                            }
                        }).catch(error => {
                            console.log("get_clients_data", error)
                            res.json({ status: 400, data: {}, message: "Verification Failed" })
                        })
                    let new_record = await transactionPools.updateOne({ 'id': addressObject.id }, { $set: { "status": amountstatus, "balance": (amountstatus == 0 || amountstatus == 1) ? 0 : (addressObject.amount - merchantbalance) } })
                    let new_record1 = await poolWallet.findOneAndUpdate({ id: addressObject.poolwalletID }, { $set: { status: ((amountstatus == 1 || amountstatus == 3) ? 0 : 1), balance: account_balance_in_ether } })
                    let get_transcation_response = await commonFunction.Get_Transcation_List(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
                    if (amountstatus != 0) {
                        // let get_addressObject    =   await commonFunction.get_Request(addressObject.callbackURL)
                        let transcationHistory = await transcationLog.find({ 'trans_pool_id': addressObject.id })
                        let transactionPoolData = await transactionPools.find({ 'id': addressObject.id })
                        let parameters = { "remainbalance": transactionPoolData.balance, "transactionHistory": JSON.stringify(transcationHistory), "status": amountstatus, "token": transactionPoolData.clientToken, "orderid": transactionPoolData.orderid }

                        console.log("parameters", parameters)
                        let get_addressObject = await commonFunction.Post_Request(addressObject.callbackURL, parameters, {})
                        console.log("get_addressObject", get_addressObject)
                    }
                }
                res.json({ status: 400, data: {}, message: "Verification Failed" })
            }
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async get_Balance(addressObject) {
        console.log("addressObject", addressObject)
        if (addressObject.networkDetails[0].cointype == "Token") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject.networkDetails[0].nodeUrl))
            let abi = [
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "balance", type: "uint256" }],
                    type: "function",
                },
            ];
            const contract = new WEB3.eth.Contract(abi, addressObject.networkDetails[0].contractAddress);
            let result = await contract.methods.balanceOf(addressObject.poolWallet[0].address).call();
            const account_balance_in_ether = await WEB3.utils.fromWei(result.toString());
            var amountstatus = await commonFunction.amount_check(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), account_balance_in_ether)
            var remaining_balance = await commonFunction.remaining_balance(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), account_balance_in_ether)
            if (amountstatus != 0) {
                let merchantbalance = account_balance_in_ether - addressObject.poolWallet[0].balance
                await clientWallets.findOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id }).
                    then(async (val) => {

                        if (val != null) {
                            let clientdetails = await clientWallets.updateOne({ id: val.id }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * 0.01))) } })
                        }
                    }).catch(error => {

                        res.json({ status: 400, data: {}, message: "Verification Failed" })
                    })
                let new_record = await transactionPools.updateOne({ 'id': addressObject.id }, { $set: { "status": amountstatus, } })
                let new_record1 = await poolWallet.findOneAndUpdate({ id: addressObject.poolwalletID }, { $set: { status: ((amountstatus == 1 || amountstatus == 3) ? 0 : 1), balance: account_balance_in_ether } })
                let get_transcation_response = await commonFunction.Get_Transcation_List(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
                if (amountstatus != 0) {

                    let transcationHistory = await transcationLog.find({ 'trans_pool_id': addressObject.id })

                    let transactionPoolData = await transactionPools.findOne({ 'id': addressObject.id })
                    let parameters = { "remainbalance": transactionPoolData.balance, "transactionHistory": JSON.stringify(transcationHistory), "status": amountstatus, "token": transactionPoolData.clientToken, "orderid": transactionPoolData.orderid }
                    let get_addressObject = await commonFunction.Post_Request(addressObject.callbackURL, parameters, {})


                }

            }

            return JSON.stringify({ status: 200, data: account_balance_in_ether, message: "Verification Failed" })
        }
        else if (addressObject.networkDetails[0].cointype == "Native") {

            const BSC_WEB3 = new Web3(new Web3.providers.HttpProvider(addressObject.networkDetails[0].nodeUrl))
            let account_balance = await BSC_WEB3.eth.getBalance(addressObject.poolWallet[0].address.toLowerCase())
            let account_balance_in_ether = Web3.utils.fromWei(account_balance.toString(), 'ether')
            var amountstatus = await commonFunction.amount_check(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), parseFloat(account_balance_in_ether))
            var remaining_balance = await commonFunction.remaining_balance(parseFloat(addressObject.poolWallet[0].balance), parseFloat(addressObject.amount), account_balance_in_ether)
            if (amountstatus != 0) {
                let merchantbalance = account_balance_in_ether - addressObject.poolWallet[0].balance
                await clientWallets.findOne({ api_key: addressObject.api_key, network_id: addressObject.networkDetails[0].id }).
                    then(async (val) => {
                        if (val != null) {

                            let clientdetails = await clientWallets.updateOne({ id: val.id }, { $set: { balance: (val.balance + (merchantbalance - (merchantbalance * 0.01))) } })

                        }
                    }).catch(error => {

                        return JSON.stringify({ status: 400, data: {}, message: "Verification Failed" })
                    })
                let new_record = await transactionPools.updateOne({ 'id': addressObject.id }, { $set: { "status": amountstatus } })
                let new_record1 = await poolWallet.findOneAndUpdate({ id: addressObject.poolwalletID }, { $set: { status: ((amountstatus == 1 || amountstatus == 3) ? 0 : 1), balance: account_balance_in_ether } })
                let get_transcation_response = await commonFunction.Get_Transcation_List(addressObject.poolWallet[0].address, addressObject.id, addressObject.networkDetails[0].id)
                if (amountstatus != 0) {
                    // let get_addressObject    =   await commonFunction.get_Request(addressObject.callbackURL)
                    let transcationHistory = await transcationLog.find({ 'trans_pool_id': addressObject.id })
                    console.log("transcationHistory", transcationHistory)
                    let transactionPoolData = await transactionPools.findOne({ 'id': addressObject.id })
                    let parameters = { "remainbalance": transactionPoolData.balance, "transactionHistory": JSON.stringify(transcationHistory), "status": amountstatus, "token": transactionPoolData.clientToken, "orderid": transactionPoolData.orderid }
                    let get_addressObject = await commonFunction.Post_Request(addressObject.callbackURL, parameters, {})
                }
            }
            return JSON.stringify({ status: 400, data: {}, message: "Verification Failed" })
        }

    },
    async Get_Transcation_From_Address(req, res) {
        try {
            let get_transcation_response = await commonFunction.Get_Transcation_List(req.body.address)
            let json_response = JSON.parse(get_transcation_response.data)
            cornJobs.block = json_response.data.result[0]["blockNumber"]
            let transcationLogs = await transcationLog.insertMany(json_response.data.result);
            res.json({ status: 200, message: "Clients Data", data: json_response.data, "transcationLogs": transcationLogs })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async get_client_Balance(req, res) {
        try {
            poolWallet.aggregate(
                [
                    { $group: { _id: '$network_id', total: { $sum: '$balance' } } },
                    { $lookup: { from: "networks", localField: "_id", foreignField: "id", as: "networkDetails" } },
                ]).then(val => {
                    res.json({ status: 200, message: "Clients Data", data: val })
                }).catch(error => {
                    console.log("get_clients_data", error)
                    res.json({ status: 400, data: {}, message: error })
                })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async kyc_approved(req, res) {
        try {

            clients.findOneAndUpdate({ api_key: req.headers.authorization }, { $set: { status: true } }, { $new: true }).then(async (val) => {
                let networks = await network.find()
                if (val != null) {
                    networks.forEach(async function (item) {
                        var web3 = new Web3(new Web3.providers.HttpProvider(item.nodeUrl));
                        var accountAddress = web3.eth.accounts.create();
                        const clientWallet = new clientWallets({
                            id: mongoose.Types.ObjectId(),
                            client_api_key: val.api_key,
                            address: accountAddress.address,
                            privatekey: accountAddress.privateKey,
                            status: 1,
                            network_id: item.id
                        });
                        let client_Wallet = await clientWallet.save()
                    });
                    res.json({ status: 200, message: "Client Added Successfully", data: val })
                }
                else {
                    res.json({ status: 400, message: "Invalid Request", data: val })
                }
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log()
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async check_kyc(req, res) {
        try {
            clients.findOne({ api_key: req.headers.authorization }).then(async (val) => {
                if (val != null) {
                    let kycurl = process.env.KYC_URL + Constant.kyc_path1 + val.api_key + Constant.kyc_path3

                    let getRequestData = await commonFunction.Get_Request_FOR_KYC(kycurl, { "Authorization": process.env.KYC_URL_TOKEN })
                    let json_response = JSON.parse(getRequestData.data)
                    console.log(json_response.data)
                    if (json_response.data.body.review_answer == "GREEN") {
                        let networks = await network.find()
                        networks.forEach(async function (item) {
                            var web3 = new Web3(new Web3.providers.HttpProvider(item.nodeUrl));
                            var accountAddress = web3.eth.accounts.create();
                            const clientWallet = new clientWallets({
                                id: mongoose.Types.ObjectId(),
                                client_api_key: val.api_key,
                                address: accountAddress.address,
                                privatekey: accountAddress.privateKey,
                                status: 1,
                                network_id: item.id
                            });
                            let client_Wallet = await clientWallet.save()
                        });
                        let clientskyc = await clients.findOneAndUpdate({ api_key: req.headers.authorization }, { $set: { status: true } }, { $new: true })
                        res.json({ status: 200, message: "", data: { "status": clientskyc.status } })

                    }
                    else if (json_response.data.body.review_answer == "RED") {
                        res.json({ status: 200, message: "KYC Rejected", data: null })
                    }
                    else {
                        res.json({ status: 200, message: "KYC Request Is In Pending State", data: null })
                    }
                }
                else {
                    res.json({ status: 400, message: "Invalid Request", data: val })
                }

            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async getClientWallets(req, res) {
        try {
            await clientWallets.aggregate(
                [
                    { $match: { client_api_key: req.headers.authorization } },
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
            res.json({ status: 400, data: {}, message: "Invalid" })
        }
    },
    async Get_Transcation_List(req, res) {
        response = {}
        let network_details = await network.findOne({ id: req.body.network_id })
        var URL = network_details.transcationurl
        if (network_details.cointype == "Token") {
            URL += "?module=account&action=tokentx&address=" + req.body.address;
            URL += "&contractaddress=" + network_details.contractAddress;
            URL += "&startblock=" + req.body.latest_block_number
            URL += "&endblock=" + "latest"
            URL += "&sort=" + "desc"
            URL += "&apikey=" + network_details.apiKey
        }
        else {
            URL += "?module=account&action=txlist&address=" + req.body.address;
            URL += "&startblock=" + req.body.latest_block_number
            URL += "&endblock=" + "latest"
            URL += "&sort=" + "desc"
            URL += "&apikey=" + network_details.apiKey
        }
        await axios.get(URL, {
            params: {},
            headers: {}
        }).then(async (res) => {
            var stringify_response = stringify(res)
            console.log("res.data.result=====================", res.data.result)
            if (res.data.result.length > 0) {
                let total_payment = 0
                console.log("element", res.data.result.length)
                res.data.result.forEach(async (element) => {
                    element["valuetowei"] = await Web3.utils.fromWei(element["value"], 'ether')
                    element["scanurl"] = network_details.scanurl + element["hash"]
                    total_payment += parseFloat(Web3.utils.fromWei(element["value"], 'ether'))
                    console.log("total_payment", total_payment)

                });
            }

            response = { status: 200, data: res.data.result, message: "Get The Data From URL" }
        }).catch(error => {
            // console.error("Error===============", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
        // return response;
        res.json({ status: 200, data: response, message: "Invalid" })
    },
    async kyc_status(req, res) {
        response = {}
        let network_details = await network.findOne({ id: req.body.network_id })
        var URL = network_details.transcationurl
        if (network_details.cointype == "Token") {
            URL += "?module=account&action=tokentx&address=" + req.body.address;
            URL += "&contractaddress=" + network_details.contractAddress;
            URL += "&startblock=" + req.body.latest_block_number
            URL += "&endblock=" + "latest"
            URL += "&sort=" + "desc"
            URL += "&apikey=" + network_details.apiKey
        }
        else {
            URL += "?module=account&action=txlist&address=" + req.body.address;
            URL += "&startblock=" + req.body.latest_block_number
            URL += "&endblock=" + "latest"
            URL += "&sort=" + "desc"
            URL += "&apikey=" + network_details.apiKey
        }
        await axios.get(URL, {
            params: {},
            headers: {}
        }).then(async (res) => {
            var stringify_response = stringify(res)
            console.log("res.data.result=====================", res.data.result)
            if (res.data.result.length > 0) {
                let total_payment = 0
                console.log("element", res.data.result.length)
                res.data.result.forEach(async (element) => {
                    element["valuetowei"] = await Web3.utils.fromWei(element["value"], 'ether')
                    element["scanurl"] = network_details.scanurl + element["hash"]
                    total_payment += parseFloat(Web3.utils.fromWei(element["value"], 'ether'))
                    console.log("total_payment", total_payment)

                });
            }

            response = { status: 200, data: res.data.result, message: "Get The Data From URL" }
        }).catch(error => {
            // console.error("Error===============", error)
            var stringify_response = stringify(error)
            response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
        })
        // return response;
        res.json({ status: 200, data: response, message: "Invalid" })
    },
    async kyc_verification_status(req, res) {
        try {
            const kycWebHookLog = new kycWebHookLogs({ id: req.body.client_user_name, webhook_data: JSON.stringify(req.body) });
            let kycWebHookLogdata = await kycWebHookLog.save()
            clients.findOne({ api_key: req.body.client_user_name }).then(async (val) => {
                if (val != null) {
                    if (req.body.review_answer == "GREEN") {
                        let networks = await network.find()
                        networks.forEach(async function (item) {
                            var web3 = new Web3(new Web3.providers.HttpProvider(item.nodeUrl));
                            var accountAddress = web3.eth.accounts.create();
                            const clientWallet = new clientWallets({
                                id: mongoose.Types.ObjectId(),
                                client_api_key: val.api_key,
                                address: accountAddress.address,
                                privatekey: accountAddress.privateKey,
                                status: 1,
                                network_id: item.id
                            });
                            let client_Wallet = await clientWallet.save()
                        });
                        let clientskyc = await clients.findOneAndUpdate({ api_key: req.body.client_user_name }, { $set: { status: true } }, { $new: true })
                        let kycclients = await clients.findOne({ api_key: req.body.client_user_name })
                        res.json({ status: 200, message: "Successfully", data: { "status": kycclients.status } })
                    }
                    else if (req.body.review_answer == "RED") {
                        let clientskyc = await clients.findOneAndUpdate({ api_key: req.body.client_user_name }, { $set: { status: false } }, { $new: true })
                        res.json({ status: 200, message: "KYC Rejected", data: null })
                    }
                    else {
                        res.json({ status: 200, message: "KYC Request Is In Pending State", data: null })
                    }
                }
                else {
                    res.json({ status: 400, message: "Invalid Request", data: null })
                }
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })

        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async clients_kyc_levels(req, res) {
        let kycurl = process.env.KYC_URL + Constant.kyc_levels
        let getRequestData = await commonFunction.Get_Request_FOR_KYC(kycurl, { "Authorization": process.env.KYC_URL_TOKEN })
        let json_response = JSON.parse(getRequestData.data)
        console.log(json_response.data)
        res.json({ status: 200, data: json_response.data, message: "" })
    },
    async allMerchant(req, res) {
        try {
            await clients.find().then(async (val) => {
                res.json({ status: 200, message: "All Merchant", data: val })
            }).catch(error => {
                console.log(error)
                res.json({ status: 400, data: {}, message: error })
            })
        }
        catch (error) {
            console.log("error", error)
            res.json({ status: 400, data: {}, message: "Invalid Request" })
        }
    },
    async customerstatus(req, res) {
        try {
            await clients.findOneAndUpdate({ api_key: req.body.api_key }, { $set: { "loginstatus": req.body.status } }, { $new: true })
                .then(async (val) => {
                    if (val != null) {
                        res.json({ status: 200, message: "Merchant Updated Successfully", data: val.email })
                    }
                    else {
                        res.json({ status: 400, message: "Customer did not find", data: null })
                    }
                })
                .catch(error => {
                    console.log('create_merchant ', error);
                    res.json({ status: 400, data: {}, message: error.message })
                });
        }
        catch (error) {
            res.json({ status: 400, data: {}, message: "Customer did not find" })
        }
    },
}