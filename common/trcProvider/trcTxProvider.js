const TronGrid  = require('trongrid');
const TronWeb = require('tronweb');
const Topuptranshash = require('../../Models/Topuptranshash');
const axios = require('axios').default;
var cron = require('node-cron');

const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': key.callbackKey
}

// const tronWeb = new TronWeb({
//     fullHost: 'https://api.trongrid.io',
//     headers: { "TRON-PRO-API-KEY": '12c2276c-a9e9-4121-8721-31c8ffb4c1c7' },
//     privateKey: '50605a439bd50bdaf3481f4af71519ef51f78865ac69bd2fda56e90be5185c78'
// });
const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io'
const privateKey = '50605a439bd50bdaf3481f4af71519ef51f78865ac69bd2fda56e90be5185c78';
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
let CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

let trc20AddressTimestamp = [];

let continueToken = '';
let timeStamp = 1668589242858;
let userCheckAddresses = [];
let toupIds = {};
let userWbhookAddresses = {};

const addAddressToCheckTRC20 = async (address) => {
    console.log("addaddress function")
    userCheckAddresses.push(address.address);
    trc20AddressTimestamp.push(Date.now());
    if (toupIds.hasOwnProperty(address.address)) {
        //
    } else {
        toupIds[address.address] = address.topup_id;
    }
}
const removeAddressToCheckTRC20 = async (address) => {
    userCheckAddresses.splice(userCheckAddresses.indexOf(address.address), 1);

    if (userWbhookAddresses.hasOwnProperty(address.address)) {
        delete userWbhookAddresses[address.address];
    }
    if (toupIds.hasOwnProperty(address.address)) {
        delete toupIds[address.address];
    }
    if (userCheckAddresses.length === trc20AddressTimestamp.length) {
        trc20AddressTimestamp.splice(userCheckAddresses.indexOf(address.address), 1);
    }
    console.log("remove address funcitn");
}

let allDecimanls = {
    'USDT': 0
};
const getDecimals = async () => {
    let contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
    let decimals = await contract.decimals().call();
    allDecimanls['USDT'] = decimals;
}
getDecimals();


//console.log(timeStamp,"8888888888888888888888888888888888888888")
const HEX_PREFIX = '41';
const hexAddressToBase58 = (hexAddress) => {
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

//privateKey: '50605a439bd50bdaf3481f4af71519ef51f78865ac69bd2fda56e90be5185c78'

async function getContractTransferEventsByUser(timeStampTron, contToken) {
    let timeStampTr = trc20AddressTimestamp.length > 0 ? Math.min(...trc20AddressTimestamp) : Date.now();

    console.log('Checking tron >>>>>>>>>>>>>>');
    if ((Date.now() - timeStampTron) > 300000) {
        trc20AddressTimestamp.splice(trc20AddressTimestamp.indexOf(timeStampTron), 1)
    }

    let result = [];

    if (contToken !== '') {
        continueToken = contToken;
    } else {
        continueToken = '';
    }
    
    let tronGrid = new TronGrid(tronWeb);
    try {
        // while (true) {
            let res = await tronGrid.contract.getEvents(CONTRACT_ADDRESS, {
                only_confirmed: false,
                event_name: "Transfer",
                limit: 200,
                sinceTimestamp: timeStampTron,
                fingerprint: continueToken,
                //order_by: "timestamp,asc",                
               // filters: { id: userId.toString() } //if you need to filter events by one or more values, for example, by user id (if this information is presented in event log), remove if you don't need it.
            });
                
            if (res.response) {
                if (!res.response.data.success) {
                    console.warn("Can't get events for the contract");
                    return false;
                }
            }

            continueToken = res.meta.fingerprint ? res.meta.fingerprint : '';

            for(let edata of res.data) {
                let address = hexAddressToBase58(edata.result.to);
                if (
                    userCheckAddresses.includes(`${address}`)
                ) {               
                     console.log(edata.result.to, 'to >>>>>>>>>>>>', address);

                    let amount = parseFloat( (edata.result.value))
                    amount = amount/10**allDecimanls['USDT'];
                    console.log(address, amount, edata.transaction_id);

                        let foundAdd = false;
                        let userAddHases = userWbhookAddresses[address]; 
                        if (userAddHases) {
                            if (userAddHases.includes(edata.transaction_id)) {
                                foundAdd = true;
                            } else {
                                userWbhookAddresses[address].push(`${edata.transaction_id}`);
                            }
                        } else {
                            userWbhookAddresses[address] = [];
                            userWbhookAddresses[address].push(`${edata.transaction_id}`);
                        }

                        if(foundAdd) {

                        } else {
                            const topupTransHash = Topuptranshash.findOne({
                                transhash: edata.transaction_id
                            });
                
                            if (topupTransHash) {
                                console.log('Hash already stored: ', edata.transaction_id);
                            } else {
                                const newTopuptranshash = new Topuptranshash;
                                newTopuptranshash.transhash = edata.transaction_id;
                                newTopuptranshash.amount = amount;
                                newTopuptranshash.topupdetails = toupIds[address];
                                await newTopuptranshash.save();
                            }
                        }
                }
            }
    } catch (error) {
        console.error(error);
    } finally {
        return result;
    }
}

let timeStampTron 
var timer = 0;

cron.schedule('* * * * * * *', () => {
  timer++;
  if (timer >= 3)
  {
      timer = 0;
    timeStampTron = Date.now();
    getContractTransferEventsByUser(timeStampTron, '');  
  }
});

timeStampTron = Date.now();
getContractTransferEventsByUser(timeStampTron, '');

module.exports = {
    getContractTransferEventsByUser,
    addAddressToCheckTRC20,
    removeAddressToCheckTRC20
}