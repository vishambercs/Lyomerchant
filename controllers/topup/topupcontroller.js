const topup              = require('../../Models/topup');
const poolWallet         = require('../../Models/poolWallet');
const networks           = require('../../Models/network');
const ApiCall            = require('../../common/Api_Call');
const Constant           = require('../../common/Constant');
const Topuptranshash     = require('../../Models/Topuptranshash');
const topupUtility       = require('../../common/topupUtility');
const clients            = require('../../Models/clients');
var otpGenerator         = require('otp-generator')
var mongoose             = require('mongoose');
var poolwalletController = require('../poolwalletController');
const clientWallets      = require('../../Models/clientWallets');
const Web3               = require('web3');
const TronWeb            = require('tronweb')
const axios              = require('axios')
var stringify            = require('json-stringify-safe');

require('dotenv').config()


var otpGenerator = require('otp-generator')
var commonFunction = require('../../common/commonFunction');

const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(Constant.USDT_ABI);


async function CheckAddress(Nodeurl, Type, cointype, Address, ContractAddress = "", privateKey = "") {


    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3" && cointype == "Token") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            if (ContractAddress != "") {
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                token_balance = await contract.methods.balanceOf(Address.toLowerCase()).call();
                let decimals = await contract.methods.decimals().call();
                format_token_balance = parseFloat(token_balance) / (1 * 10 ** decimals)
            }
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')

            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if (Type == "Web3" && cointype == "Native") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
            format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
            let balanceData = { "token_balance": native_balance, "format_token_balance": format_native_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else if (Type == "btcnetwork") {
            let COINGECKO_URL = "http://blockchain.info/q/addressbalance/" + Address
            response = {}
            await axios.get(COINGECKO_URL, {
                params: {},
                headers: {}
            }).then(res => {
                var stringify_response = stringify(res)
                console.log(stringify_response)
                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }

            }).catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)
                console.log(stringify_response)
                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };

            })
            var stringify_response = JSON.parse(response.data)
            console.log("data", stringify_response.data)
            let balance_format = parseFloat(stringify_response.data) / 100000000
            console.log("balance_format", balance_format)
            let balanceData =
            {
                "token_balance": stringify_response.data,
                "format_token_balance": balance_format,
                "native_balance": stringify_response.data,
                "format_native_balance": balance_format
            }
            return { status: 200, data: balanceData, message: "sucess" }
        }
        else {
            const HttpProvider = TronWeb.providers.HttpProvider;
            const fullNode = new HttpProvider(Nodeurl);
            const solidityNode = new HttpProvider(Nodeurl);
            const eventServer = new HttpProvider(Nodeurl);
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            let contract = await tronWeb.contract().at(ContractAddress);
            native_balance = await tronWeb.trx.getBalance(Address)
            token_balance = await contract.balanceOf(Address).call();
            format_token_balance = tronWeb.toBigNumber(token_balance)
            format_token_balance = tronWeb.toDecimal(format_token_balance)
            format_token_balance = tronWeb.fromSun(format_token_balance)
            format_native_balance = tronWeb.toBigNumber(native_balance)
            format_native_balance = tronWeb.toDecimal(format_native_balance)
            format_native_balance = tronWeb.fromSun(format_native_balance)
            let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
            return { status: 200, data: balanceData, message: "sucess" }
        }

    }
    catch (error) {
        console.log(error)
        let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return { status: 400, data: balanceData, message: "Error" }
    }
}

const HEX_PREFIX = '41';
const hexAddressToBase58 = (tronWeb, hexAddress) => {
    let retval = hexAddress;
    try {
        
        if (hexAddress.startsWith("0x")) {
            hexAddress = HEX_PREFIX + hexAddress.substring(2);
        }
        let bArr = tronWeb.utils['code'].hexStr2byteArray(hexAddress);
        retval = tronWeb.utils['crypto'].getBase58CheckAddress(bArr);
    } catch (e) {
        //Handle
    }
    return retval;
}

async function Check_Trans_Hash(Nodeurl, Type, cointype, tranxid, address, ContractAddress = "", privateKey = "") {

    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {

        if (Type == "Web3") {
            const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            let hashtrans = await WEB3.eth.getTransactionReceipt(tranxid)
            let transaction = await WEB3.eth.getTransaction(tranxid)
           const result = decoder.decodeData(transaction.input);
            
            let tradata = {}

            if (hashtrans != null && hashtrans.contractAddress == null) {
                let amount = Web3.utils.hexToNumber(hashtrans.logs[0].data);
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                let decimals = await contract.methods.decimals().call();
                let format_token_balance = parseFloat(amount) / (1 * 10 ** decimals)
                let address_real_one = Object.keys(result).length > 0 ? result.inputs : []
                let trans_address = address_real_one.length > 0 ? "0X" + address_real_one[0] : ""

                tradata = {
                    "amount": amount,
                    "formatedamount": format_token_balance,
                    "addressto": trans_address.toLowerCase(),
                    "transhash": tranxid,
                    "transaddress": address.toLowerCase(),
                    "status": trans_address.toLowerCase() == address.toLowerCase(),

                }

                return { status: 200, data: tradata, message: "" }
            }
            else if (transaction != null) {
                tradata = {

                    "amount": transaction.value,
                    "formatedamount": WEB3.utils.fromWei(transaction.value, 'ether'),
                    "addressto": transaction.to.toLowerCase(),
                    "transhash": tranxid,
                    "transaddress": address.toLowerCase(),
                    "status": transaction.to.toLowerCase() == address.toLowerCase(),

                }

                return { status: 200, data: tradata, message: "" }
            }


            return { status: 200, data: hashtrans, message: "" }
        }
        else if (Type == "btcnetwork") {
            let COINGECKO_URL = process.env.BTC_BALANCE_CHECK_URL_HASH + tranxid
            response = {}
            await axios.get(COINGECKO_URL, {
                params: {},
                headers: {}
            }).then(res => {
                var stringify_response = stringify(res)

                response = { status: 200, data: stringify_response, message: "Get The Data From URL" }

            }).catch(error => {
                console.error("Error", error)
                var stringify_response = stringify(error)

                response = { status: 404, data: stringify_response, message: "There is an error.Please Check Logs." };
            })
            var stringify_response = JSON.parse(response.data)

            let tradata = null
            if (stringify_response.data.errorCode == 0) {
                let btcdata = stringify_response.data.data.vout
                let index = btcdata.filter(translist => translist.scriptPubKey.address.toLowerCase() == address.toLowerCase())

                if (index.length > 0) {
                    tradata = {
                        "amount": index[0].value,
                        "formatedamount": index[0].value,
                        "addressto": index[0].address,
                        "transhash": tranxid,
                        "transaddress": address.toLowerCase(),
                        "status": index[0].address == address.toLowerCase(),
                    }
                }
            }
            return { status: 200, data: tradata, message: "sucess" }
        }
        else {
            const HttpProvider = TronWeb.providers.HttpProvider;
            const fullNode = new HttpProvider(Nodeurl);
            const solidityNode = new HttpProvider(Nodeurl);
            const eventServer = new HttpProvider(Nodeurl);
            const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            let getConfirmedTransc = await tronWeb.getEventByTransactionID(tranxid);
            let tradata = null
            let data = getConfirmedTransc[0].result;

            let format_native_balance = tronWeb.toBigNumber(data.value);
            format_native_balance = tronWeb.toDecimal(format_native_balance);
            format_native_balance = tronWeb.fromSun(format_native_balance);

            tradata = {
                "amount": parseFloat(data.value),
                "formatedamount": parseFloat(format_native_balance),
                "addressto": hexAddressToBase58(tronWeb, data.to),
                "transhash": tranxid,
                "transaddress": address.toLowerCase(),
                "status": (hexAddressToBase58(tronWeb, data.to)).toLowerCase() == address.toLowerCase(),
            }
            return { status: 200, data: tradata, message: "sucess" }
        }

    }
    catch (error) {
        console.log(error)
        let balanceData = { "token_balance": token_balance, "format_token_balance": format_token_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return null
    }
}

async function updateOtherAPI(tx_status, tx_id, toupid, tx_hash, orderid, coin, crypto_amount, fiat_amount, network_id, address, fiat_usd, network_name, createdAt, timestamps) {

    var data = '';

    var params = "tx_status=" + tx_status
    params += "&tx_id=" + tx_id
    params += "&toupid=" + toupid
    params += "&tx_hash=" + tx_hash
    params += "&orderid=" + orderid
    params += "&coin=" + coin
    params += "&crypto_amount=" + crypto_amount
    params += "&fiat_amount=" + fiat_amount
    params += "&network_id=" + network_id
    params += "&address=" + address
    params += "&fiat_usd=" + fiat_usd
    params += "&network_name=" + network_name
    params += "&createdAt=" + createdAt
    params += "&timestamps=" + timestamps
    var config = {
        method: 'post',
        url: 'https://api.pulseworld.com:9987/v1/create_tx_records?',
        headers: {},
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

}

async function getTimeprice(time, coin) {
    try {
        const getBalanceRes = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${coin}USDT&interval=1m&startTime=${time}&limit=1`);
        return getBalanceRes.data[0][4];
    } catch (e) {
        console.log(e);
        return 1;
    }
}




const bscTxTestProvider = require('../../common/bscProvider/bscTxTestProvider');
const bscTxProvider = require('../../common/bscProvider/bscTxProvider');
const ercTxProvider = require('../../common/ercProvider/ercTxProvider');
const trcTxProvider = require('../../common/trcProvider/trcTxProvider');


const addCheckAddressTx = async (transId) => {
  
    const toupData = await topup.findOne({
        id: transId,
    });
    console.log("toupData",toupData)
    if (toupData) {
        const poolWalletData = await poolWallet.findOne({
            _id: toupData.pwid,
        });

        console.log("poolWalletData",poolWalletData)
        if (poolWalletData) {
            const networkData = await networks.findOne({
                _id: toupData.nwid,
            });
            console.log("networkData",networkData)
            if (networkData) {
                if (networkData.coin === 'tUSDT') {
                    bscTxTestProvider.addAddressToCheckBEP20({
                        address: poolWalletData.address,
                        topup_id: toupData._id,
                    })
                } else {
                    if(['ERC20', 'ETH'].includes(networkData.network)) {
                        ercTxProvider.addAddressToCheckERC20({
                            address: poolWalletData.address,
                            topup_id: toupData._id,
                        });
                    }
                    if(networkData.network === 'TRC20') {
                        console.log('Add wallet address: ', poolWalletData.address, toupData._id);
                        trcTxProvider.addAddressToCheckTRC20({
                            address: poolWalletData.address,
                            topup_id: toupData._id,
                        })
                    }
                    if (networkData.network === 'BSC') {
                        bscTxProvider.addAddressToCheckBEP20({
                            address: poolWalletData.address,
                            topup_id: toupData._id,
                        })
                    }
                }
            }
        }
    }
}


module.exports =
{
    async create_top_payment(req, res) {
        try {
           
            var merchantKey = req.headers.authorization
            var networkType = req.body.networkType
            var orderid = req.body.orderid
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());

            let account = await poolwalletController.getPoolWalletID(networkType)
            let network_details = await networks.findOne({ 'id': networkType })

            let client = await clients.findOne({ 'api_key': req.headers.authorization })
            let amount = Object.keys(req.body).indexOf("amount") == -1 ? 0 : parseFloat(req.body.amount)
            const transactionPool = new topup({
                id: mongoose.Types.ObjectId(),
                pwid: account._id,
                nwid: network_details._id,
                clientdetail: client._id,
                api_key: req.headers.authorization,
                poolwalletID: account.id,
                amount: 0,
                fixed_amount: amount,
                currency: req.body.currency,
                callbackURL: req.body.callbackurl,
                apiredirectURL: req.body.apiredirecturl,
                errorurl: req.body.errorurl,
                orderid: req.body.orderid,
                status: 0,
                walletValidity: currentDate,
                transtype: amount > 0 ? 2 : 1,
                remarks: req.body.remarks,
                timestamps: new Date().getTime()
            });
            transactionPool.save().then(async (val) => {
                await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                await addCheckAddressTx(val.id);
                let url = process.env.TOP_UP_URL + val.id
                if(req.body.transtype == "wewe"){
                    url = process.env.WEWE_UP_URL + val.id
                }
                else if(req.body.transtype == "fapi"){
                    url = process.env.LYOMERCHANT_UP_URL + val.id
                }
                let data = { url: url }
                res.json({ status: 200, message: "Assigned Merchant Wallet Successfully", data: data })
            }).catch(error => {
                console.log("error", error)
                res.json({ status: 400, data: {}, message: "Please Contact Admin" })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },
    async create_top_payment_withPoolWallet(req, res) {
        try {
            var merchantKey = req.headers.authorization
            var networkType = req.body.networkType
            var orderid = req.body.orderid
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());
            let network = await networks.findOne({ id: networkType })
            let url = process.env.WALLET_CREATION_URL + network.network
            let WALLET_CALLBACK_URL = process.env.WALLET_CALLBACK_URL + "/updatetransbyid"
            let parameters = { callBackUrl: WALLET_CALLBACK_URL, orderId: orderid }
            let response = await ApiCall.callPoolWalletAPI(url, parameters, {})
            let network_details = await networks.findOne({ 'id': networkType })
            let client = await clients.findOne({ 'api_key': req.headers.authorization })
         
            if (response.status == 400) {
                return res.json({ status: 400, data: {}, message: "Please Contact Admin" })
            }

            let amount = Object.keys(req.body).indexOf("amount") == -1 ? 0 : parseFloat(req.body.amount)
            const transactionPool = new topup({
                id: mongoose.Types.ObjectId(),
                api_key: req.headers.authorization,
                poolwalletID: "",
                amount: 0,
                fixed_amount: amount,
                currency: req.body.currency,
                callbackURL: req.body.callbackurl,
                apiredirectURL: req.body.apiredirecturl,
                errorurl: req.body.errorurl,
                orderid: req.body.orderid,
                status: 5,
                nwid: network_details._id,
                clientdetail: client._id,
                walletValidity: currentDate,
                transtype: amount > 0 ? 2 : 1,
                remarks: req.body.remarks,
                timestamps: new Date().getTime()
            });
            transactionPool.save().then(async (val) => {
                // await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
                let url = process.env.TOP_UP_URL + val.id
                let data = { url: url }
                res.json({ status: 200, message: "Assigned Merchant Wallet Successfully", data: data })
            }).catch(error => {
                console.log("error", error)
                res.json({ status: 400, data: {}, message: "Please Contact Admin" })
            })
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Error" })
        }
    },

    async updatetransbyid(req, res) {
        try {
            
            let topupdata = await topup.findOne({ orderid: req.body.orderId })
            if (req.body.status == "address") {
                let network = await networks.findOne({ _id: topupdata.nwid })
                let account = await poolwalletController.savePoolWallet(network.id, req.body.address)
                let topupdataupdate = await topup.findOneAndUpdate({ id: topupdata.id },
                    {
                        $set: {
                            poolwalletID: account.id,
                            pwid: account._id,
                            status: 0,
                            get_address_at: new Date().toString(),
                        }
                    }, { returnDocument: 'after' })
                let poolWalletdata = await poolWallet.findOneAndUpdate({ id: account.id },
                    {
                        $set:
                        {
                            status: 1
                        }
                    }, { returnDocument: 'after' })
                 
                    return res.json({ status: 200, data: {}, message: "Data Recieved" })

            }
            else if (req.body.status == "balance")
            {
                let status      = 0
                let address     = req.body.address;
                let amount      = parseFloat(req.body.amount);
                let transhash   = req.body.transhash;
                let polwallet   = await poolWallet.findOne({ 'address': address, status: 1 })
                let tpup        = await topup.findOne({ 'poolwalletID': polwallet.id, status: { $in: [0, 2] } })

                let Topuptransdata       = await Topuptranshash.findOne({ 'topupdetails': tpup._id, transhash:transhash })
                
                if(Topuptransdata != null)
                {
                    return  res.status(400).json({ status: 400, data: {}, message: "Invalid Data" })
                }

                let response = await topupUtility.verifyTheBalancebyWebsocket(tpup.id, amount, transhash)
                let jsonresponse = JSON.parse(response)
                var index = Constant.topupTransList.findIndex(translist => translist.transkey == tpup.id)
                
                if ((jsonresponse.amountstatus == 1 || jsonresponse.amountstatus == 3) && index != -1 ) 
                {
                    Constant.topupTransList[index].connection.sendUTF(response);
                    Constant.topupTransList[index].connection.close(1000)
                    Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != tpup.id);
                    let url = process.env.FREE_ADDRESS_URL + address
                    let response_get_api = await ApiCall.callGetAPI(url, {}, {})
                    let updatedpoolWallet = await poolWallet.findOneAndUpdate({ id: polwallet.id }, { $set: { status: 0 } })
                    console.log("response_get_api", response_get_api)
                }

                else if (index != -1)
                {
                    console.log(index)
                    console.log(response)
                    let transData       = Constant.topupTransList[index]
                    transData.connection.sendUTF(response); 
                }
                else  
                {
                    
                }
                return res.json({ status: 200, data: {}, message: "Data Recieved" })
            }
            return  res.status(400).json({ status: 400, data: {}, message: "Invalid Key" })
        }
        catch (error) {
            console.log(error)
            return  res.status(400).json({ status: 400, data: {}, message: "error" })
        }
    },
    async get_top_payment_data(req, res) {
        try {
            let transactionPool = await topup.findOne({ id: req.body.id })

            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })

            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })
          
            let Topup_trans_hash = await Topuptranshash.find({ topupdetails: transactionPool._id })
            
            let data =
            {
                transactionID: transactionPool.id,
                address: transWallet.address,
                walletValidity: transactionPool.walletValidity,
                amount: transactionPool.amount,
                key: transactionPool.api_key,
                apiredirecturl: transactionPool.apiredirectURL,
                callbackURL: transactionPool.callbackURL,
                errorurl: transactionPool.errorurl,
                orderid: transactionPool.orderid,
                network: network.network,
                coin: network.coin,
                status: transactionPool.status,
                fixed_amount: transactionPool.fixed_amount,
                payment_history : Topup_trans_hash,
            }
            res.json({ status: 200, message: "Get The Data", data: data })


        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async cancelpaymentLink(req, res) {
        try {
            let tranPool = await topup.findOne({ id: req.body.id })
            if (tranPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transactionPool = await topup.findOneAndUpdate({ 'id': tranPool.id }, { $set: { "status": 5, "remarks": "By Client Canceled", "canceled_at": new Date().toString() } }, { returnDocument: 'after' })
            let data =
            {
                transactionID: transactionPool.id,
                orderid: transactionPool.orderid,
            }
            res.json({ status: 200, message: "Get The Data", data: data })


        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async checkbalance(req, res) {
        try {
            let transactionPool = await topup.findOne({ id: req.body.id })

            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })

            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })

            let balance = await CheckAddress(
                network.nodeUrl,
                network.libarayType,
                network.cointype,
                transWallet.address,
                network.contractAddress,
                transWallet.privateKey
            )

            let statusdata = Constant.transstatus.filter(index => index.id == transactionPool.status)

            let data =
            {
                transactionID   : transactionPool.id,
                address         : transWallet.address,
                walletValidity  : transactionPool.walletValidity,
                amount          : transactionPool.amount,
                key             : transactionPool.api_key,
                status          : transactionPool.status,
                statustitle     : statusdata,
                apiredirecturl  : transactionPool.apiredirectURL,
                callbackURL     : transactionPool.callbackURL,
                errorurl        : transactionPool.errorurl,
                orderid         : transactionPool.orderid,
                network         : network.network,
                coin            : network.coin,
                balance         : balance,
                fait_amount     : transactionPool.fiat_amount,
                createdAt       : transactionPool.createdAt,
                updated_at      : transactionPool.updated_at,
            }
            res.json({ status: 200, message: "Get The Data", data: data })

        }
        catch (error) {
            console.log("checkbalance", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async verfiythebalance(req, res) {
        try {
            let transactionPool = await topup.findOneAndUpdate(
                { id: req.body.id, status: 0 }, {
                    $set:
                    {
                        status: req.body.status,
                        manaulupdatedby: req.body.name,
                        manaulupdatedat: new Date().toString()
                    }
            })

            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })

            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })
            let balance = await CheckAddress(network.nodeUrl, network.libarayType, network.cointype, transWallet.address, network.contractAddress, transWallet.privateKey)
            let statusdata = Constant.transstatus.filter(index => index.id == transactionPool.status)
            let data =
            {
                transactionID: transactionPool.id,
                address: transWallet.address,
                walletValidity: transactionPool.walletValidity,
                amount: transactionPool.amount,
                key: transactionPool.api_key,
                status: transactionPool.status,
                statustitle: statusdata,
                apiredirecturl: transactionPool.apiredirectURL,
                callbackURL: transactionPool.callbackURL,
                errorurl: transactionPool.errorurl,
                orderid: transactionPool.orderid,
                network: network.network,
                coin: network.coin,
                balance: balance,
            }
            res.json({ status: 200, message: "Get The Data", data: data })

        }
        catch (error) {
            console.log("checkbalance", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async verfiytranshash(req, res) {
        try {
            let trans_hash = req.body.transhash;

            let transactionPool = await topup.findOne({ id: req.body.id })

            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }

            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })
            let balance = await Check_Trans_Hash(network.nodeUrl, network.libarayType, network.cointype, trans_hash, transWallet.address.toLowerCase(), network.contractAddress, transWallet.privateKey)
            res.json({ status: 200, message: "Get The Data", data: balance })

        }
        catch (error) {
            console.log("checkbalance", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async sendotp(req, res) {
        try {

            let trans_hash = req.body.transhash;
            var otp = otpGenerator.generate(6, { digits: true, specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false, });

            let transactionPool = await topup.findOne({ id: req.body.id, })

            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            transactionPool.otp = otp
            await transactionPool.save()

            var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": process.env.trans_email, "subject": "Email Verification Token", "templateData": { "password": otp, "url": "" } }
            let email_response = await commonFunction.sendEmailFunction(emailTemplateName)
            res.json({ status: 200, message: "Get The Data", data: "" })

        }
        catch (error) {
            console.log("checkbalance", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async updatetransbycallback(req, res) {
        try {
            let status      = 0
            let address     = req.body.address;
            let amount      = parseFloat(req.body.amount);
            let transhash   = req.body.transhash;
            let polwallet   = await poolWallet.findOne({ 'address': address, status: 1 })
            let tpup        = await topup.findOne({ 'poolwalletID': polwallet.id, status: { $in: [0, 2] } })
            if (tpup.transtype == 2) {
                status = (amount + tpup.crypto_paid) == tpup.fiat_amount ? 1 : status;
                status = (amount + tpup.crypto_paid) < tpup.fiat_amount && amount > 0 ? 2 : status;
                status = (amount + tpup.crypto_paid) > tpup.fiat_amount && amount > 0 ? 3 : status;
            }
            else {
                status = amount > 0 ? 1 : status;
            }



            let responseapi = await topupUtility.verifyTheBalancebyWebsocket(tpup.id, amount, transhash)
            let response = { transkey: tpup.id, amountstatus: status, "paid_in_usd": responseapi.paid_in_usd, "paid": responseapi.paid, status: 200, message: "Success" };
            let responseapijson = JSON.parse(responseapi)
            var index = Constant.topupTransList.findIndex(translist => translist.transkey == tpup.id)

            if (status == 1 || status == 3) {

                Constant.topupTransList[index].connection.sendUTF(JSON.stringify(response));
                Constant.topupTransList[index].connection.close(1000)
                Constant.topupTransList = await Constant.topupTransList.filter(translist => translist.transkey != tpup.id);
                let url = process.env.FREE_ADDRESS_URL + address
                let response_get_api = await ApiCall.callGetAPI(url, {}, {})
                let updatedpoolWallet = await poolWallet.findOneAndUpdate({ id: polwallet.id }, { $set: { status: 0 } })
                console.log("response_get_api", response_get_api)
            }
            else {
                Constant.topupTransList[index].connection.sendUTF(JSON.stringify(response));
            }
            res.json({ status: 200, data: {}, message: "Done" })
        }
        catch (error) {
            console.log("checkbalance", error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },
    async updatetrans(req, res) 
    {
        try 
        {
            if(req.body.amount == 0  || req.body.amount  == undefined  )
            {
                return res.json({ status: 400, message: "Invalid Amount", data: {} })
            }
            let transactiondata = await topup.findOne( { id: req.body.id , otp:req.body.otp ,status : 0 },)
            if (transactiondata == null) 
            {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactiondata.poolwalletID })
            if (transWallet == null) 
            {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network     = await networks.findOne({ id: transWallet.network_id })
            let balance = await Check_Trans_Hash(network.nodeUrl, network.libarayType, network.cointype, req.body.transhash, transWallet.address.toLowerCase(), network.contractAddress, transWallet.privateKey)
            
            if(balance.status == 400){
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            
            if(Object.keys(balance.data).length  == 0 ){
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let totalamount  = parseFloat(transactiondata.amount) + parseFloat(balance.data.formatedamount)

            let status  = parseFloat(transactiondata.fixed_amount) == parseFloat(totalamount)  ? 1 : 0
            status  = parseFloat(totalamount)   > parseFloat(transactiondata.fixed_amount)      ? 1 : 0


            let transactionPool = await topup.findOneAndUpdate(
                { id: req.body.id , otp:req.body.otp , status : 0 },
                { $set : {
                    status          : status,
                    transhash       : req.body.transhash,
                    amount          : parseFloat(transactiondata.amount) + parseFloat(balance.data.formatedamount),
                    updated_at      : new Date().toString(),
                }},
                {'returnDocument' : 'after'}
                )
            if (transactionPool == null) 
            {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }

            let transhashdata = await Topuptranshash.insertMany({
                transhash    : req.body.transhash,
                amount       : balance.data.formatedamount,
                topupdetails : transactionPool._id,
                updated_at   : new Date().toString() 
            })
            
            let price  = 1
            if(network.stablecoin == false)
            {
             price      = await getTimeprice(transactionPool.timestamps, network.coin.toUpperCase())
            }
         
           
            let faitprice = price * req.body.amount
            
            await topup.findOneAndUpdate( {id: req.body.id }, { $set : { fiat_amount :  faitprice } })
            
            // await updateOtherAPI(1, 
            //     req.body.transhash, 
            //     transactionPool.id ,
            //     req.body.transhash, 
            //     transactionPool.orderid,
            //     network.coin,
            //     transactionPool.amount,
            //     faitprice,network.id,transWallet.address,faitprice,
            //     network.network,
            //     new Date().toString(),transactionPool.timestamps )

            res.json({ status: 200, message: "Get The Data", data: "" })
            
        }
        catch (error) {
            console.log("updatetrans",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    }, 
    async updatetrans_with_network(req, res) 
    {
        try 
        {
            let transactionPool = await topup.findOneAndUpdate( {id: req.body.id }, {$set : { nwid  : req.body.nwid,}}, {'returnDocument' : 'after'})
            
            if (transactionPool == null) 
            {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOneAndUpdate({ id: transactionPool.poolwalletID }, {$set : { networkDetails  : req.body.nwid }}, {'returnDocument' : 'after'})
            
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
           res.json({ status: 200, message: "Get The Data", data: "" })
            
        }
        catch (error) {
            console.log("updatetrans_with_network",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    }, 

}



