const Web3          = require('web3');
const WEB3          = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"))
const Constant      = require('./common/Constant');
const Network       = require('./Models/network');
const poolWallet    = require('./Models/poolWallet');
const TronWeb       = require('tronweb')
process.on("message",async (parameters) => {
  var minutes = 0;
  var remain = 0;
  var status = 0 ;
  console.log(parameters)
  while(minutes < 10 && status == 0)
  {
   
  let balancedata     = await checkbalance(parameters.address,parameters.details,parameters.walletdetails);
  let balance         = 
  { 
    "balancedata" : balancedata , 
    "address"     : parameters.address,  
  } 
  parameters.walletdetails

  const previousdate  = new Date(parseInt(parameters.timestamp));
  const currentdate   = new Date().getTime()
  var diff            = currentdate - previousdate.getTime();
  minutes             = (diff / 60000)
  // status              = (parameters.walletdetails.previousbalance - balancedata.format_balance ) > 0 ? 1 : 0
  balance["time"]     = minutes
  balance["remain"]   = parameters.amount - (parameters.walletdetails.previousbalance - balancedata.format_balance )
  balance["address"]  = parameters.address
  balance["status"]   = status
  balance["amount"]   = parameters.amount
  balance["paid"]     = balancedata.format_balance
  balance["transid"]  = parameters.transid
  process.send(balance);
  }
  process.exit();
})

async function checkbalance(address,details,walletdetails)
{

  if(details != null )
  {
    return {"status":400, "balance":0,"format_balance":0 ,"native_balance": 0, "format_native_balance": 0,"message": "Invalid Network"};
  }
  let checkadd = await CheckAddress(details.nodeUrl, details.libarayType,details.cointype, address, details.contractAddress, walletdetails.privateKey)
  return checkadd;
}
async function CheckAddress(Nodeurl, Type,cointype, Address, ContractAddress = "", privateKey = "") {
  let balance = 0
  let format_balance = 0
  let native_balance = 0
  let format_native_balance = 0
  
  try {
      if (Type == "Web3") 
      {
          const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
          if (ContractAddress != "") 
          {
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
      // else if(Type == "Web3" && cointype == "Native")
      // {
      //   const WEB3 = new Web3(new Web3.providers.HttpProvider(Nodeurl))
      //   let native_balance = await WEB3.eth.getBalance(Address.toLowerCase())
      //   let format_native_balance = await Web3.utils.fromWei(native_balance.toString(), 'ether')
      //   let balanceData = {  message: "sucess",status: 200, "balance": native_balance, "format_balance": format_native_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
      //   return balanceData
      // }
      else {
          const HttpProvider = TronWeb.providers.HttpProvider;
          const fullNode = new HttpProvider(Nodeurl);
          const solidityNode = new HttpProvider(Nodeurl);
          const eventServer = new HttpProvider(Nodeurl);
          const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
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
      console.log(error)
      let balanceData = { status: 400,message: "Error","balance": balance, "format_balance": format_balance, "native_balance": native_balance, "format_native_balance": format_native_balance }
      return balanceData
  }
}