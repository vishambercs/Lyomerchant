const topup = require('../../Models/topup');
const poolWallet = require('../../Models/poolWallet');
const networks = require('../../Models/network');
const clients = require('../../Models/clients');
const Constant = require('../../common/Constant');
var otpGenerator = require('otp-generator')
var mongoose = require('mongoose');
var poolwalletController = require('../poolwalletController');
const clientWallets = require('../../Models/clientWallets');
const Web3 = require('web3');
const TronWeb = require('tronweb')
require('dotenv').config()
const axios               = require('axios')
var stringify             = require('json-stringify-safe');
var otpGenerator = require('otp-generator')
var commonFunction = require('../../common/commonFunction');

const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(Constant.USDT_ABI);


async function CheckAddress(Nodeurl, Type,cointype ,Address, ContractAddress = "", privateKey = "") {
   
    
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {
        if (Type == "Web3" &&  cointype == "Token"   ) {
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
        else if (Type == "Web3" &&  cointype == "Native") {
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

async function Check_Trans_Hash(Nodeurl, Type,cointype ,tranxid, address,ContractAddress = "", privateKey = "") {
   
    let token_balance = 0
    let format_token_balance = 0
    let native_balance = 0
    let format_native_balance = 0
    try {

        if (Type == "Web3") 
        {
            const WEB3          = new Web3(new Web3.providers.HttpProvider(Nodeurl))
            let hashtrans       = await WEB3.eth.getTransactionReceipt(tranxid)
            let transaction       = await WEB3.eth.getTransaction(tranxid)
            console.log("decoder========== transaction",transaction);
            const result = decoder.decodeData(transaction.input);
            console.log("decoder==========",result);
            let tradata = {}
        
            if(hashtrans != null && hashtrans.contractAddress == null)
            {
                let amount = Web3.utils.hexToNumber(hashtrans.logs[0].data);
                const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
                let decimals                = await contract.methods.decimals().call();
                let format_token_balance    = parseFloat(amount) / (1 * 10 ** decimals)
                let address_real_one        = Object.keys(result).length > 0 ? result.inputs : []
                let trans_address           = address_real_one.length > 0 ? "0X"+address_real_one[0] : ""

                tradata = {
                    "amount"            : amount,
                    "formatedamount"    : format_token_balance,
                    "addressto"         : trans_address.toLowerCase(),
                    "transhash"         : tranxid,
                    "transaddress"      : address.toLowerCase(),
                    "status"            : trans_address.toLowerCase() == address.toLowerCase(),
                    
                }
        
                return { status: 200, data: tradata,message: "" }
            } 
            else if(transaction != null){
                tradata = {
                    
                    "amount"            : transaction.value,
                    "formatedamount"    : WEB3.utils.fromWei(transaction.value,'ether') ,
                    "addressto"         : transaction.to.toLowerCase(),
                    "transhash"         : tranxid,
                    "transaddress"      : address.toLowerCase(),
                    "status"            : transaction.to.toLowerCase() == address.toLowerCase(),
                    
                }
        
                return { status: 200, data: tradata,message: "" }
            }


            return { status: 200, data: hashtrans, message: "" }
        }
         else if (Type == "btcnetwork") {
            let COINGECKO_URL = process.env.BTC_BALANCE_CHECK_URL_HASH+tranxid
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
            if(stringify_response.data.errorCode == 0 )
            {
                let btcdata =  stringify_response.data.data.vout
                let index   =  btcdata.filter(translist => translist.scriptPubKey.address.toLowerCase() == address.toLowerCase())
                
                if(index.length > 0){
                    tradata = {
                        "amount"            : index[0].value,
                        "formatedamount"    : index[0].value,
                        "addressto"         : index[0].address,
                        "transhash"         : tranxid,
                        "transaddress"      : address.toLowerCase(),
                        "status"            : index[0].address == address.toLowerCase(),
                    }
                }
            }
            return { status: 200, data: tradata, message: "sucess" }
        }
        else 
        {
            const HttpProvider       = TronWeb.providers.HttpProvider;
            const fullNode           = new HttpProvider(Nodeurl);
            const solidityNode       = new HttpProvider(Nodeurl);
            const eventServer        = new HttpProvider(Nodeurl);
            const tronWeb            = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
            let getConfirmedTransc   = await tronWeb.trx.getConfirmedTransaction(tranxid);
            let tradata              = null
            let data = getConfirmedTransc.raw_data.contract[0].parameter
          
            tradata = {
                "amount"            : data.value.amount,
                "formatedamount"    : data.value.amount,
                "addressto"         : data.value.to_address,
                "transhash"         : tranxid,
                "transaddress"      : address.toLowerCase(),
                "status"           : data.value.to_address == address.toLowerCase(),
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

async function updateOtherAPI(tx_status, tx_id,toupid ,tx_hash, orderid,coin,crypto_amount,fiat_amount,network_id,address,fiat_usd,network_name,createdAt,timestamps ) {
   
var data = '';

var params = "tx_status="+tx_status
    params += "&tx_id="+tx_id
    params += "&toupid="+toupid
    params += "&tx_hash="+tx_hash
    params += "&orderid="+orderid
    params += "&coin="+coin
    params += "&crypto_amount="+crypto_amount
    params += "&fiat_amount="+fiat_amount
    params += "&network_id="+network_id
    params += "&address="+address
    params += "&fiat_usd="+fiat_usd
    params += "&network_name="+network_name
    params += "&createdAt="+createdAt
    params += "&timestamps="+timestamps
    var config = {
    method: 'post',
    url: 'https://api.pulseworld.com:9987/v1/create_tx_records?',
    headers: { },
    data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

}

async function getTimeprice(time, coin)  {
    try {
       const getBalanceRes = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${coin}USDT&interval=1m&startTime=${time}&limit=1`);
       return getBalanceRes.data[0][4];
    } catch(e) {
       console.log(e);
       return 1;
    }
}





module.exports =
{
    async create_top_payment(req, res) {
        try 
        {
            var merchantKey = req.headers.authorization
            var networkType = req.body.networkType
            var orderid = req.body.orderid
            let currentDateTemp = Date.now();
            let currentDate = parseInt((currentDateTemp / 1000).toFixed());
            let account = await poolwalletController.getPoolWalletID(networkType)
            let network_details = await networks.findOne({ 'id': networkType })
            let client = await clients.findOne({ 'api_key': req.headers.authorization })
            let amount = Object.keys(req.body).indexOf("amount") == -1 ?  0 : parseFloat(req.body.amount)
            const transactionPool = new topup({
                id  : mongoose.Types.ObjectId(),
                pwid : account._id,
                nwid : network_details._id,
                clientdetail : client._id,
                api_key: req.headers.authorization,
                poolwalletID: account.id,
                amount: amount,
                currency: req.body.currency,
                callbackURL: req.body.callbackurl,
                apiredirectURL: req.body.apiredirecturl,
                errorurl: req.body.errorurl,
                orderid: req.body.orderid,
                status: 0,
                walletValidity  : currentDate,
                transtype       : amount > 0 ? 2 : 1,
                remarks: req.body.remarks,
                timestamps: new Date().getTime()
            });
            transactionPool.save().then(async (val) => {
                await poolWallet.findOneAndUpdate({ 'id': val.poolwalletID }, { $set: { status: 1 } })
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
    async get_top_payment_data(req, res) {
        try {
            let transactionPool = await topup.findOne({ id: req.body.id , status : 0 })
           
            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
          
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network = await networks.findOne({ id: transWallet.network_id })
            let data =
            {
                transactionID   : transactionPool.id,
                address         : transWallet.address,
                walletValidity  : transactionPool.walletValidity,
                amount          : transactionPool.amount,
                key             : transactionPool.api_key,
                apiredirecturl  : transactionPool.apiredirectURL,
                callbackURL     : transactionPool.callbackURL,
                errorurl        : transactionPool.errorurl,
                orderid         : transactionPool.orderid,
                network         : network.network,
                coin            : network.coin
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
            let tranPool     = await topup.findOne({id  : req.body.id })
            if(tranPool == null)
            {
               return  res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transactionPool = await topup.findOneAndUpdate({ 'id':tranPool.id  }, { $set: { "status" : 5 , "remarks" : "By Client Canceled" , "canceled_at" : new Date().toString() }} ,{ returnDocument: 'after' })
            let data = 
            { 
                transactionID: transactionPool.id, 
                orderid     : transactionPool.orderid,
            }
            res.json({ status: 200, message: "Get The Data", data: data })

            
        }
        catch (error) {
            console.log(error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    }, 
    async checkbalance(req, res) 
    {
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
            
            let balance =  await CheckAddress(
                network.nodeUrl, 
                network.libarayType,
                network.cointype,
                transWallet.address, 
                network.contractAddress,  
                transWallet.privateKey
                ) 
               
            let statusdata =   Constant.transstatus.filter(index => index.id ==transactionPool.status)
            
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
                
            }
            res.json({ status: 200, message: "Get The Data", data: data })
            
        }
        catch (error) {
            console.log("checkbalance",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },  
    async verfiythebalance(req, res) 
    {
        try 
        {
            let transactionPool = await topup.findOneAndUpdate(
            { id: req.body.id ,status: 0} , {$set:
            {
                status          : req.body.status,
                manaulupdatedby : req.body.name,
                manaulupdatedat : new Date().toString()
            }})
            
            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
            
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network     = await networks.findOne({ id: transWallet.network_id })
            let balance     = await CheckAddress(network.nodeUrl,network.libarayType,network.cointype,transWallet.address, network.contractAddress, transWallet.privateKey) 
            let statusdata  = Constant.transstatus.filter(index => index.id ==transactionPool.status)
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
            }
            res.json({ status: 200, message: "Get The Data", data: data })
            
        }
        catch (error) {
            console.log("checkbalance",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    },

    async verfiytranshash(req, res) 
    {
        try 
        {
            let trans_hash      = req.body.transhash;
            
            let transactionPool = await topup.findOne({id: req.body.id })
            
            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            
            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network     = await networks.findOne({ id: transWallet.network_id })
            let balance     = await Check_Trans_Hash(network.nodeUrl,network.libarayType,network.cointype,trans_hash,transWallet.address.toLowerCase() ,network.contractAddress, transWallet.privateKey) 
            res.json({ status: 200, message: "Get The Data", data: balance })
            
        }
        catch (error) {
            console.log("checkbalance",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    }, 
    async sendotp(req, res) 
    {
        try 
        {
            
            let trans_hash      = req.body.transhash;
            var otp = otpGenerator.generate(6, { digits: true ,specialChars :false,lowerCaseAlphabets :false,upperCaseAlphabets :false,});
    
            let transactionPool = await topup.findOne({id: req.body.id , })

            if (transactionPool == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            transactionPool.otp = otp
            await transactionPool.save()

            var emailTemplateName = { "emailTemplateName": "accountcreation.ejs", "to": process.env.trans_email , "subject": "Email Verification Token", "templateData": { "password": otp, "url": "" } }
            let email_response    = await commonFunction.sendEmailFunction(emailTemplateName)
            res.json({ status: 200, message: "Get The Data", data: "" })
            
        }
        catch (error) {
            console.log("checkbalance",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    }, 
    
    async updatetrans(req, res) 
    {
        try 
        {
            if(req.body.amount == 0  ||req.body.amount  == undefined  )
            {
                return res.json({ status: 400, message: "Invalid Amount", data: {} })
            }
            
            let transactionPool = await topup.findOneAndUpdate(
                {id: req.body.id , otp:req.body.otp , status : 0 },
                {$set : {
                    status          : 1,
                    transhash       : req.body.transhash,
                    amount          : req.body.amount,
                    updated_at      : new Date().toString(),
                }},
                {'returnDocument' : 'after'}
                )
            
                if (transactionPool == null) 
            {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
           

            let transWallet = await poolWallet.findOne({ id: transactionPool.poolwalletID })
            if (transWallet == null) {
                return res.json({ status: 400, message: "Invalid Trans ID", data: {} })
            }
            let network     = await networks.findOne({ id: transWallet.network_id })
            let price = await getTimeprice(transactionPool.timestamps, network.coin.toUpperCase())
            let faitprice = price * req.body.amount
            console.log("faitprice",faitprice)
            await topup.findOneAndUpdate( {id: req.body.id }, { $set : { fiat_amount :  faitprice } })
            
            await updateOtherAPI(1, 
                req.body.transhash, 
                transactionPool.id ,
                req.body.transhash, 
                transactionPool.orderid,
                network.coin,
                transactionPool.amount,
                faitprice,network.id,transWallet.address,faitprice,
                network.network,
                new Date().toString(),transactionPool.timestamps)

            res.json({ status: 200, message: "Get The Data", data: "" })
            
        }
        catch (error) {
            console.log("checkbalance",error)
            res.json({ status: 400, data: {}, message: "Unauthorize Access" })
        }
    }, 

    
}



