const axios = require('axios').default;
const Web3 = require('web3');
const ethereumBloomFilters = require('ethereum-bloom-filters');
const Topuptranshash = require('../../Models/Topuptranshash');

const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': key.callbackKey
}

const tokenAddress = [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", //USDT
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53", //BUSD
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC 
    "0xb7277a6e95992041568d9391d09d0122023778a2", // USDC Proxy
    "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf", // USDC
]  //USDC                
                     
const tokenDecimals = [6, 18, 6, 6, 6];                  
let userCheckAddresses = [];

const addAddressToCheckERC20 = async (address) => {
    console.log("addAddressToCheck ERC20")
    userCheckAddresses.push(address);
}

const removeAddressToCheckERC20 = async (address) => {
    userCheckAddresses.splice(userCheckAddresses.indexOf(address),1);
    console.log("remove AddressToCheck ERC20")
}


ETHNODEWSURL =  'wss://ws-nd-702-556-899.p2pify.com/7f0daa4e61d85154c6cae4bfc43d8d26';
ETHNODEHTTPURL = "https://nd-702-556-899.p2pify.com/7f0daa4e61d85154c6cae4bfc43d8d26";

// Websocket
const createWebSocket = async (ETHNODEWSURL) => {
    console.log("----------Configuring NodeWebSocket-----------",ETHNODEWSURL);
    var options = {
        timeout: 30000, // ms
        // // Useful for credentialed urls, e.g: ws://username:password@localhost:8546
        // headers: {
        //   authorization: 'Basic username:password'
        // },
        clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: 60000 // ms
        },
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: 5,
            onTimeout: false
        }
    };
    try {
        var Web3WS = new Web3(new Web3.providers.WebsocketProvider(ETHNODEWSURL,options));
        var Web3HTTP = new Web3(new Web3.providers.HttpProvider(ETHNODEHTTPURL))

        const checkInputLogs = async (txHash, toAddress) => {
            try {
                const inputLogsRes = await Web3HTTP.eth.getTransactionReceipt(`${txHash}`);
                let address = JSON.stringify(inputLogsRes.logs[0].topics[2])
                let address1 = address.slice(27,67)
                address1=("0x"+address1);
                address1=address1;
                if (toAddress.toLowerCase() == address1.toLowerCase()) {
                    return address1; 
                } else {
                    return false;
                }
            } catch(e) {
                return false;
            }
        }

        console.log("----------Subscribing Blockheader event------ ",ETHNODEWSURL)
        //Subscribe to the event for new block headers.
        var subscription = Web3WS.eth.subscribe('newBlockHeaders', function(error, result){
            if (!error) {
                return;
            }
            console.error(error);
        })
        .on("connected", function(subscriptionId){
            //console.log("----------SUCCESS : subscribed with ID -------",subscriptionId);
            //console.log("\n\nBlock #")
        })
        .on("data", function(blockHeader){
                Web3WS.eth.getBlock(blockHeader.number).then((data)=>{
                const logsBloom1 = data.logsBloom
                for(j=0;j<tokenAddress.length;j++) {   
                    const tokenAddressToCheck = tokenAddress[j];
                    // console.log(tokenAddressToCheck, 'Outer >>>>>>>>>>>>>>>>');
                let a = ethereumBloomFilters.isContractAddressInBloom(logsBloom1, tokenAddressToCheck)
                let decimals =tokenDecimals[j];
                // console.log("ERC20",blockHeader.number)
                if(a)  {
                    transactions = data.transactions;
                    //console.log(transactions)
                    for (i=0;i<transactions.length;i++) {
                        Web3WS.eth.getTransactionReceipt(transactions[i]).then(async(data) => {
                            for(let walletAddress of userCheckAddresses) {
                                // console.log(walletAddress, tokenAddressToCheck, 'Detected Token Internal >>>>>>>>>>>>>>>>');
                                const logsBloom2 = data.logsBloom;
                                try {
                                    let b = ethereumBloomFilters.isUserEthereumAddressInBloom(logsBloom2,walletAddress.address)
                                    if(b) {
                                        // console.log(logsBloom2);
                                        console.log(walletAddress.address, tokenAddressToCheck, 'Detected Bloom >>>>>>>>>>>>>>>>', data.transactionHash);
                                        const checkAddInReceipt = await checkInputLogs(data.transactionHash, walletAddress.address);

                                        console.log(checkAddInReceipt, 'INput logs >>>>>>>>>>>');

                                        if (checkAddInReceipt) {
                                            console.log("walletAddress detected",walletAddress.address)
                                            
                                            let address = JSON.stringify(data.logs[0].topics[2])
                                            let address1 = address.slice(27,67)
                                            address1=("0x"+address1);
                                            address1=JSON.stringify(address1)
                                            address =walletAddress.address.toLocaleLowerCase();
                                            address = JSON.stringify(address);
                                            if (address1 == address)
                                            {
                                                // console.log("\n\n           T R A  N S A C T I O N   D E T E C T E D ! !       ")
                                                // console.log("               TX HASH:",data.transactionHash,walletAddress);
                                                //let amount = Web3.utils.hexToNumber(data.logs[0].data);
                                                let amount = Web3.utils.hexToNumberString(data.logs[0].data);
                                                //console.log("amount",amount);
                                                parseFloat(amount);
                                                amount = amount/10**decimals;
                                                console.log("amount in formated",amount);

                                                const newTopuptranshash = new Topuptranshash;
                                                newTopuptranshash.transhash = data.transactionHash;
                                                newTopuptranshash.amount = amount;
                                                newTopuptranshash.topupdetails = walletAddress.topup_id;
                                                await newTopuptranshash.save();
                                            }
                                            console.log(console.log("\n             T O K E N  T R A  N S A C T I O N   D E T E C T E D ! !       \n\n"));
                                        }
                                    }
                                } catch(e) { 
                                    console.log(e)
                                }
                            } 
                        });
                    }
                }
            }
            });
        })
        .on("error", console.error);
    }
    catch(error){
        console.log("Node websocket error / Tx detection error",error);
    }
}
//createWebSocket(ETHNODEWSURL);
try {
    createWebSocket(BSCNODEWSURLMAIN);
} catch(e) {
    console.log('Ws Faliewd');
}

module.exports = {
    addAddressToCheckERC20 ,removeAddressToCheckERC20 
}