const Web3          = require('web3');
const WEB3          = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"))
const Constant      = require('./common/Constant');
const Network       = require('./Models/network');
const poolWallet    = require('./Models/poolWallet');
const Utility       = require('./common/Utility');
const TronWeb       = require('tronweb');
require("dotenv").config()


process.on("message",async (parameters) => {
  var minutes  = 0;
  var remain   = 0;
  var status   = 0 ;
  let balance          = {}
  const previousdate  = new Date(parseInt(parameters.timestamp));
  while(minutes < process.env.SOCKET_TIME && (status == 0 || status == 2))
  {

  let balancedata      = await checkbalance(parameters.address,parameters.details,parameters.walletdetails);

  balance          = 
  { 
    "balancedata" : balancedata , 
    "address"     : parameters.address,  
  }
  
  status              =   balancedata.format_balance  == parameters.amount  ? 1 : status
  status              =   balancedata.format_balance  > parameters.amount   ? 3 : status 
  status              =   balancedata.format_balance > 0 && (balancedata.format_balance  < parameters.amount)   ? 2 : status 
  const currentdate   = new Date().getTime()
  var diff            = currentdate - previousdate.getTime();
  minutes             = (diff / 60000)
  status              = status
  balance["time"]     = minutes
  balance["remain"]   = parameters.amount - balancedata.format_balance
  balance["address"]  = parameters.address
  balance["status"]   = status
  balance["amount"]   = parameters.amount
  balance["paid"]     = balancedata.format_balance
  balance["transid"]  = parameters.transid
  process.send(balance);
 }
 process.send(balance);
 process.exit();
})

async function checkbalance(address,details,walletdetails)
{
   
  if(details == null )
  {
    return {"status":400, "balance":0,"format_balance":0 ,"native_balance": 0, "format_native_balance": 0,"message": "Invalid Network"};
  }
  
  let checkadd = await CheckAddress(details.nodeUrl, details.libarayType,details.cointype, address, details.contractAddress, "")
   if(checkadd.balance > 0)
   {
    console.log("Web3 checkadd Fixed Pool========================================",checkadd)
   }
   return checkadd;
}
async function CheckAddress(Nodeurl, Type,cointype, Address, ContractAddress = "", privateKey = "") {
 
  let balance = 0
  let format_balance = 0
  let native_balance = 0
  let format_native_balance = 0
  try {
      if (Type == "Web3" && cointype == "Token") {
         const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
          if (ContractAddress != "") {
              const contract = new WEB3.eth.Contract(Constant.USDT_ABI, ContractAddress);
              balance = await contract.methods.balanceOf(Address.toLowerCase()).call();
              let decimals = await contract.methods.decimals().call();
              format_balance = balance / (1 * 10 ** decimals)
          }
          native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
          format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
          native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
          format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')

          let balanceData = {  message: "sucess",status: 200, "balance": balance, "format_balance": format_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
          return balanceData
      }
      else if (Type == "Web3" && cointype == "Native") {
      
        const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
        let native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
        let format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
        let balanceData = {  message: "sucess",status: 200, "balance": native_balance, "format_balance": format_native_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
        return balanceData
      }
      else if (Type == "btcnetwork" && cointype == "Native") {
        let url         = process.env.BTC_BALANCE_CHECK_URL+Address
        let balance     = await Utility.Get_RequestByAxios(url,{},{})
        let balanceData = {}
        if(balance.status == 200)
        {
        let btcaddress = JSON.parse(balance.data).data
        let bal       = btcaddress.errorCode == 0 ?  +(btcaddress.data.wallet_Balance)  : 0.0
        let status    = btcaddress.errorCode == 0 ? 200 : 400
        let message    = btcaddress.errorCode == 0 ? "sucess" : "error"
        balanceData = { message:message,status: status, "balance": bal, "format_balance": bal, "native_balance": bal, "format_native_balance": bal }
        console.log(balanceData)
        }
        else{
          balanceData = { message:"Error",status: balance.status, "balance": 0, "format_balance": 0, "native_balance": 0, "format_native_balance": 0 }
        }
        return balanceData
      }
      else 
      {
      const HttpProvider = TronWeb.providers.HttpProvider;
      const fullNode = new HttpProvider("https://api.trongrid.io");
      const solidityNode = new HttpProvider("https://api.trongrid.io");
      const eventServer = new HttpProvider("https://api.trongrid.io");
      const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, "50605a439bd50bdaf3481f4af71519ef51f78865ac69bd2fda56e90be5185c78");
          let contract = await tronWeb.contract().at(ContractAddress);
          native_balance = await tronWeb.trx.getBalance(Address)
          balance = await contract.balanceOf(Address).call();
          format_balance = tronWeb.toBigNumber(balance)
          format_balance = tronWeb.toDecimal(format_balance)
          format_balance = tronWeb.fromSun(format_balance)
          format_native_balance = tronWeb.toBigNumber(native_balance)
          format_native_balance = tronWeb.toDecimal(format_native_balance)
          format_native_balance = tronWeb.fromSun(format_native_balance)
          let balanceData = { status: 200, message: "sucess","balance": balance, "format_balance": format_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
          return balanceData
      }

  }
  catch (error) {
    
      console.log("Error========================================",error)
      let balanceData = { status: 400,message: "Error","balance": balance, "format_balance": format_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
      return balanceData
  }
}