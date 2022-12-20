const WebSocket =  require('ws');
const Topuptranshash = require('../../Models/Topuptranshash');
let ws = new WebSocket('wss://ws.blockchain.info/inv');

let userCheckAddresses = [];

const addAddressToCheckBTC = async (address) => {
    console.log("addAddressToCheck BTC")
    userCheckAddresses.push(address);
}

const removeAddressToCheckBTC = async (address) => {
    userCheckAddresses.splice(userCheckAddresses.indexOf(address),1);
    console.log("remove AddressToCheck BTC")
}

ws.onopen = async () => {
    var msg = {
        "op": "unconfirmed_sub"           
    }
   ws.send (JSON.stringify(msg))
};

ws.onmessage = async (event) => {
  try{
    // console.log('BTC Checking');
      // //let wallet = JSON.parse(event.data).x.out.addr
      for (let userCheckAddress of userCheckAddresses) {
        let address = JSON.parse(event.data).x.out.find((address) => address.addr == userCheckAddress.address);
        if(address){
            //console.log("address",address.addr)
            let txHash = JSON.parse(event.data).x.hash;
            let amount = address.value/10**8
            let walletAddress = address.addr;
            console.log(txHash,walletAddress,amount)  

            console.log(headers, 'Live >>>>>>>>');
            
            const newTopuptranshash = new Topuptranshash;
            newTopuptranshash.transhash = data.transactionHash;
            newTopuptranshash.amount = amount;
            newTopuptranshash.topupdetails = userCheckAddress.topup_id;
            await newTopuptranshash.save();
    
        } else {
            console.log("not found address", address)
        }
      }

  }

  catch(error){
      console.log(error)
  }
} 

ws.onclose = async (error) => {
    console.log(error);
    ws = new WebSocket('wss://ws.blockchain.info/inv');
}

module.exports = {
  addAddressToCheckBTC,
  removeAddressToCheckBTC,
}