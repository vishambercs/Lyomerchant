const axios = require('axios').default;
const Web3 = require('web3');
const ethereumBloomFilters = require('ethereum-bloom-filters');
const Topuptranshash = require('../../Models/Topuptranshash');

// const key = require('../../config/key');

const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': key.callbackKey
}

const tokenAddress = [
   '0xF5EB513a31af1Af797E3514a713cCc11492FB2df',  //tUSDT
   '0xfA2FeC9D77Da1F45E6C0D24C2CB6036811924C1A', // LYO Credit
]  //LYO PAY

const tokenDecimals = [8, 18]  //tUSDT, //LYO PAY, //USDT
let userCheckAddresses = [];

const addAddressToCheckBEP20 = async (address) => {
    console.log("addaddress function")
    userCheckAddresses.push(address);
}
const removeAddressToCheckBEP20 = async (address) => {
    userCheckAddresses.splice(userCheckAddresses.indexOf(address),1);
    console.log("remove address funcitn")
}
BSCNODEWSURL =  'wss://ws-nd-120-172-313.p2pify.com/8894cc433e39dcc770bf0508892eddec';
// Websocket
let createWebSocket =
async function createWebSocket (BSCNODEWSURL) {
console.log("----------Configuring NodeWebSocket-----------",BSCNODEWSURL);
var options = {
    timeout: 30000, // ms
    clientConfig: {
      maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
      maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
      keepalive: true,
      keepaliveInterval: 60000 // ms
    },
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};
try {
var Web3WS = new Web3(new Web3.providers.WebsocketProvider(BSCNODEWSURL,options));
console.log("----------Subscribing Blockheader event------ ",BSCNODEWSURL);

const checkInputLogs = async (txHash, toAddress) => {
    try {
        const inputLogsRes = await Web3WS.eth.getTransactionReceipt(`${txHash}`);
        let address = JSON.stringify(inputLogsRes.logs[0].topics[2])
        let address1 = address.slice(27,67)
        address1=("0x"+address1);
        address1=address1;

        if (toAddress == address1) {
            return address1; 
        } else {
            return false;
        }
    } catch(e) {
        return false;
    }
}
// checkInputLogs();
//Subscribe to the event for new block headers.
var subscription = Web3WS.eth.subscribe('newBlockHeaders', function(error, result){
    if (!error) {
        return;
    }
    console.error(error);
})
.on("connected", function(subscriptionId){
    console.log("----------SUCCESS : subscribed with ID -------",subscriptionId);
    console.log("\n\nBlock #")
})
.on("data", function(blockHeader){
        Web3WS.eth.getBlock(blockHeader.number).then((data)=>{        
        const logsBloom1 = data.logsBloom
        for(j=0;j<tokenAddress.length;j++){        
        let a = ethereumBloomFilters.isContractAddressInBloom(logsBloom1,tokenAddress[j])
        let decimals =tokenDecimals[j];
        // console.log(" BSC TEST ",blockHeader.number)
        if(a)
        {   
            console.log("tokenAddress");
            transactions = data.transactions;
            for (i=0;i<transactions.length;i++)
            {
            Web3WS.eth.getTransactionReceipt(transactions[i]).then( async (data)=>{
                for(let walletAddress of userCheckAddresses) {
                    const logsBloom2 = data.logsBloom;
                    
                    try {
                        //walletAddress = '0xfBBD5c1223Ba15a28e8eB435fDbdE95F432C428c';
                        //let ab = ethereumBloomFilters.isUserEthereumAddressInBloom(logsBloom1,walletAddress)
                        let b = ethereumBloomFilters.isUserEthereumAddressInBloom(logsBloom2,walletAddress.address)
                        if(b)
                        {
                            const checkAddInReceipt = await checkInputLogs(data.transactionHash, walletAddress.address);

                            if (checkAddInReceipt) {
                                console.log("walletAddress detected",walletAddress.address)
                                let address = JSON.stringify(data.logs[0].topics[2])
                                let address1 = address.slice(27,67)
                                address1=("0x"+address1);
                                address1=JSON.stringify(address1)
                                address =walletAddress.address.toLocaleLowerCase();
                                address = JSON.stringify(address);
                                if (address1 == address);
                                {
                                    //console.log("\n\n           T R A  N S A C T I O N   D E T E C T E D ! !       ")
                                    //console.log("               TX HASH:",data.transactionHash,walletAddress);
                                    
                                    //let amount = Web3.utils.hexToNumber(data.logs[0].data);
                                    let amount = Web3.utils.hexToNumberString(data.logs[0].data);
                                    parseFloat(amount);
                                    amount = amount / 10**decimals;
                                    console.log("amount in formated",amount)                          
                                    // const userAddressToSend = await UserAddress.findOne({
                                    //     address: walletAddress
                                    // });
                
                                    // if (userAddressToSend) 
                                    const newTopuptranshash = new Topuptranshash;
                                    newTopuptranshash.transhash = data.transactionHash;
                                    newTopuptranshash.amount = amount;
                                    newTopuptranshash.topupdetails = walletAddress.topup_id;
                                    await newTopuptranshash.save();
        
                                    console.log("amount",amount);
                                    
                                }
                            }

                        }
                    } catch(e) {
                        console.log(e);
                        }
                    }
                });
                }
                }
            }
        });
    });
}
catch(error){
        console.log("Node websocket error / Tx detection error",error);
    }
}

//createWebSocket(BSCNODEWSURL);
try {
    createWebSocket(BSCNODEWSURL);
} catch(e) {
    console.log(e);
    console.log('Ws Faliewd');
}

const bep20Test = {
    addAddressToCheckBEP20,
    removeAddressToCheckBEP20
}
module.exports = bep20Test