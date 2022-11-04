const Web3 = require('web3');
const WEB3 = new Web3(new Web3.providers.HttpProvider("https://nd-702-556-899.p2pify.com/7f0daa4e61d85154c6cae4bfc43d8d26"))


process.on("message",async (message) => {
  console.log("message",message)
  let balancedata  = await checkbalance(message);
  let balance      = {"balancedata" : balancedata , "address" : message } 
  console.log("balance",balance)
  process.send(balance);
  process.exit();
})
async function checkbalance(a){
  let balance = await WEB3.eth.getBalance(a.toLowerCase())
  return balance;
}