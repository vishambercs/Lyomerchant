const Web3      = require('web3');
const WEB3      = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"))
const Constant  = require('./common/Constant');

process.on("message",async (parameters) => {
  var minutes = 0;
  var remain = 0;
  var status = 0 ;
  while(minutes < 10 && status == 0)
  {
  let balancedata     = await checkbalance(parameters.address);
  let balance         = 
  { 
    "balancedata" : balancedata , 
    "address"     : parameters.address,  
  } 
  
  const previousdate  = new Date(parseInt(parameters.timestamp));
  const currentdate   = new Date().getTime()
  var diff            = currentdate - previousdate.getTime();
  minutes = (diff / 60000)
  status = parseFloat(balancedata.format_balance) > 0 ? 1 : 0
  balance["time"]     = minutes
  balance["remain"]   = parameters.amount - balancedata.format_balance
  balance["address"]  = parameters.address
  balance["status"]   = status
  balance["amount"]   = parameters.amount
  balance["paid"]     = balancedata.format_balance
  balance["transid"]  = parameters.transid
  process.send(balance);
  }
  process.exit();
})

async function checkbalance(a)
{
  const contract       = new WEB3.eth.Contract(Constant.USDT_ABI, "0xf5eb513a31af1af797e3514a713ccc11492fb2df");
  let balance          = await contract.methods.balanceOf(a.toLowerCase()).call();
  let decimals         = await contract.methods.decimals().call();
  let format_balance   = balance / (1 * 10 ** decimals)
  return  {
    "balance":balance,
  "format_balance":format_balance};
}