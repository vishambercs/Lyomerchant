const WebSocket = require('ws').WebSocket;

// const UserAddress = require("../../models/user_address");
const axios = require('axios').default;
const Web3 = require('web3');
const ethereumBloomFilters = require('ethereum-bloom-filters');
const Topuptranshash = require('../../Models/Topuptranshash');
// var cron = require('node-cron');
// var qs = require('qs');
// const key = require('../../config/key');

const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': key.callbackKey
}

const tokenAddress = [
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', //BUSD 18
    '0x9bad6C75b5a4E72dF8147cc89d068cc848648e59', // LYO Credit
    '0x55d398326f99059fF775485246999027B3197955', // USDT
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
]

const tokenDecimals = [18, 8, 18, 18];
let userCheckAddresses = [];

// const checkIfAssigned = async () => {
//     const userAssingedAddresses = await UserAddress.find({
//         assignFlag: true,
//         type: "BEP20"
//     });
//     for (let userAssignedAdd of userAssingedAddresses) {
//         userCheckAddresses.push(userAssignedAdd.address);
//     }
// }

// checkIfAssigned();
const addAddressToCheckBEP20 = async (address) => {
    console.log("addAddressToCheckBEP20 main >>>>>>>>>>>>>>>")
    userCheckAddresses.push(address);
}

const removeAddressToCheckBEP20 = async (address) => {
    userCheckAddresses.splice(userCheckAddresses.indexOf(address),1);
    console.log("remove AddressToCheckBEP20")

}

BSCNODEWSURLMAIN =  'wss://ws-nd-234-036-002.p2pify.com/f4cef12222dbeeef7393a1f4f7d67848';
// Websocket
var subscription;
var currentDate = Date.now();
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
        var Web3WS = new Web3(new Web3.providers.WebsocketProvider(BSCNODEWSURLMAIN,options));
        const checkInputLogs = async (txHash) => {
            try {
                const inputLogsRes = await Web3WS.eth.getTransactionReceipt(`${txHash}`);
                let address = JSON.stringify(inputLogsRes.logs[0].topics[2])
                let address1 = address.slice(27,67)
                address1=("0x"+address1);
                address1=address1;
                return address1;
            } catch(e) {
                return false;
            }
        }

        console.log("----------Subscribing Blockheader event------ ",BSCNODEWSURLMAIN)
        //Subscribe to the event for new block headers.
        subscription = Web3WS.eth.subscribe('newBlockHeaders', function(error, result) {
            if (!error) {
                return;
            }
            console.error(error);
        })
        .on("connected", function(subscriptionId) {
            console.log("----------SUCCESS : subscribed with ID -------",subscriptionId);
            console.log("\n\nBlock #")
        })
        .on("data", function(blockHeader){
                Web3WS.eth.getBlock(blockHeader.number).then((data)=>{        
                const logsBloom1 = data.logsBloom
                for(j=0;j<tokenAddress.length;j++){        
                let a = ethereumBloomFilters.isContractAddressInBloom(logsBloom1,tokenAddress[j])
                let decimals =tokenDecimals[j];
                currentDate = Date.now();
                // console.log("BSC BEP20 MAIN",blockHeader.number)
                if(a)
                {   
                    // console.log("token address detected")           ;
                    transactions = data.transactions;
                    for (i=0;i<transactions.length;i++)
                    {
                    Web3WS.eth.getTransactionReceipt(transactions[i]).then( async (data)=>{
                        for(let walletAddress of userCheckAddresses) {
                            // console.log(walletAddress, 'user address');
                            
                            try {
                                //let ab = ethereumBloomFilters.isUserEthereumAddressInBloom(logsBloom1, walletAddress)
                                const logsBloom2 = data.logsBloom;
                                //walletAddress = "0x83f127d049d1acd28944CF22d272b615283bebD4";
                                let b = ethereumBloomFilters.isUserEthereumAddressInBloom(logsBloom2, walletAddress.address)
                                if(b)
                                {
                                    const checkAddInReceipt = await checkInputLogs(data.transactionHash);

                                    if (checkAddInReceipt) {
                                        console.log("walletAddress detected", walletAddress.address)
                                        let address = JSON.stringify(data.logs[0].topics[2])
                                        let address1 = address.slice(27, 67)
                                        address1=("0x"+address1);
                                        address1=JSON.stringify(address1)
                                        //console.log(address);
                                        address =walletAddress.address.toLocaleLowerCase();
                                        address = JSON.stringify(address);
                                        //console.log("\nComparing the related addresses\n",address,address1);
                                        if (address1 == address);
                                        {
                                            //console.log("\n\n           T R A  N S A C T I O N   D E T E C T E D ! !       ")
                                            //console.log("               TX HASH:",data.transactionHash,walletAddress);
                                            console.log("amount",data.logs[0].data);
                                            //let amount = Web3.utils.hexToNumber(data.logs[0].data);
                                            let amount = Web3.utils.hexToNumberString(data.logs[0].data);
                                            parseFloat(amount);
                                            amount = amount / 10**decimals;
                                            
                        
                                            const newTopuptranshash = new Topuptranshash;
                                            newTopuptranshash.transhash = data.transactionHash;
                                            newTopuptranshash.amount = amount;
                                            newTopuptranshash.topupdetails = walletAddress.topup_id;
                                            await newTopuptranshash.save();
                                        }
                                    }
                                }
                            } catch(e) {
                                
                            }
                            
                            }
                        });
                        }
                        }
                    }
                });
            })
            .on("close", function(){
                console.log("\n\n Ws closed");
            })
            .on("error", (e) => {
                console.log('Faield', e)                
            });
    } catch(error) {
        console.log("Node websocket error / Tx detection error", error);
    }
}
  
try {
    createWebSocket(BSCNODEWSURLMAIN);
} catch(e) {
    console.log('Ws Faliewd');
}

const bep20Main = {
    addAddressToCheckBEP20,
    removeAddressToCheckBEP20
}

module.exports = bep20Main;
