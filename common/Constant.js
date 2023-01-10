const address = []
const block = 0
const transid = ""
const index = 0
const postransindex = 0
const kycindex = 0
const translists = []
const kycapplication = []
const interval = ""
const kycinterval = ""
const kyc_path1 = "/api/users/"
const kyc_path2 = "/kyc/client/link"
const kyc_path3 = "/level/LMT_basic_level/kyc"
const kyc_levels = "/api/kyc/levels"
const web_hook_link = "/api/clients/webhook/"
const posTransList = []
const paymenlinkTransList = []
const paymenlinkIndex = 0

const topupTransList = []
const topupIndex = 0
const addressBalance = []
const ALL_API = []
const transstatus = [
  { "id": 0, "title": "Pending" },
  { "id": 1, "title": "Completed" },
  { "id": 2, "title": "Partial" },
  { "id": 3, "title": "Completed" },
  { "id": 4, "title": "Expired" },
  { "id": 5, "title": "Canceled" }
]
const abi =
  [
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
  ];



const GAS_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    type: 'function',
  },
];
const USDT_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]
const CATEGORY = ["admin","network","paymentlink","wallet","hotWallet","withdraw"]
// const updating = [
    
//     {
//         "_id": "63b537d7298fc34951f5890e",
//         "api_path": "/admin/v1/get_all_API",
//         "category": "Roles/Access Management",
//         "name": "View All Available Access",
//         "description": "View All Available Access",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.559Z",
//         "middleware": "all-access",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58910",
//         "api_path": "/admin/v1/create_roles_permission",
//         "category": "Roles/Access Management",
//         "name": "Set Admin User Access Permission",
//         "description": "Set Admin User Access Permission",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.561Z",
//         "middleware": "set-user-access",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58911",
//         "api_path": "/admin/v1/get_all_roles",
//         "category": "Roles/Access Management",
//         "name": "View All Roles",
//         "description": "View All Roles",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.562Z",
//         "middleware": "all-roles",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58912",
//         "api_path": "/admin/v1/update_role_Permisson",
//         "category": "Roles/Access Management",
//         "name": "Update User Access Permission",
//         "description": "Update User Access Permission",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.563Z",
//         "middleware": "update-user-access",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58913",
//         "api_path": "/admin/v1/get_all_roles_with_permission",
//         "category": "Roles/Access Management",
//         "name": "View User Access Permission",
//         "description": "View User Access Permission",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.563Z",
//         "middleware": "view-user-access",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5890f",
//         "api_path": "/admin/v1/create_or_update_roles",
//         "category": "Roles/Access Management",
//         "name": "Create New Admin Role",
//         "description": "Create New Admin Role",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.570Z",
//         "middleware": "create-role",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e8",
//         "api_path": "/admin/v1/orphanPoolWallet",
//         "category": "Orphan Wallet Management",
//         "name": "View All Orphan PW",
//         "description": "View All Orphan Pool Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.533Z",
//         "middleware": "all-orphan-pw",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e9",
//         "api_path": "/admin/v1/orphanPoolWalletBalance",
//         "category": "Orphan Wallet Management",
//         "name": "View Orphan PW Balance",
//         "description": "View Orphan Pool Wallet Balance",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.534Z",
//         "middleware": "orphan-pw-balance",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588ea",
//         "api_path": "/admin/v1/saveorphanWallet",
//         "category": "Orphan Wallet Management",
//         "name": "Create New Orphan PW",
//         "description": "Create New Orphan Pool Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.535Z",
//         "middleware": "create-orphan-pw",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588f1",
//         "api_path": "/admin/v1/allFeedWallets",
//         "category": "Feeding Wallet Management",
//         "name": "View All Feed. Wallets",
//         "description": "View All Feed. Wallets",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.540Z",
//         "middleware": "all-wallet",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588f2",
//         "api_path": "/admin/v1/deleteWallets",
//         "category": "Feeding Wallet Management",
//         "name": "Delete Feed. Wallets",
//         "description": "Delete Feed. Wallets",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.541Z",
//         "middleware": "delete-feed-w",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588f6",
//         "api_path": "/admin/v1/createfw",
//         "category": "Feeding Wallet Management",
//         "name": "Create New Feeding Wallet",
//         "description": "Create New Feeding Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.605Z",
//         "middleware": "create-feed-w",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588f7",
//         "api_path": "/admin/v1/checkbalance",
//         "category": "Feeding Wallet Management",
//         "name": "View Wallet Balance",
//         "description": "View Wallet Balance",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.544Z",
//         "middleware": "feed-w-balance",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588f8",
//         "api_path": "/admin/v1/approvecategoryRequest",
//         "category": "Payment Services",
//         "name": "Approve/Enable Merchant  Request",
//         "description": "Approve/Enable Merchant Request",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.545Z",
//         "middleware": "e-d-merchant-request",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588f9",
//         "api_path": "/admin/v1/savecategory",
//         "category": "Payment Services",
//         "name": "Create New Payment Service",
//         "description": "Create New Payment Service",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.546Z",
//         "middleware": "new-payment-service",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588fa",
//         "api_path": "/admin/v1/allcategory",
//         "category": "Payment Services",
//         "name": "View All Services",
//         "description": "View All Services (In Admin)",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.546Z",
//         "middleware": "all-services",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588fb",
//         "api_path": "/admin/v1/createClientCategory",
//         "category": "Payment Services",
//         "name": "Create New Services Request",
//         "description": "Create New Services Request (In Merchant)",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.547Z",
//         "middleware": "new-service",
//         "updatedAt": "2023-01-04T13:25:10.430Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588fc",
//         "api_path": "/admin/v1/getAllClientCategoryRequest",
//         "category": "Payment Services",
//         "name": "View All Merchants Request",
//         "description": "View All Merchants Request",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.548Z",
//         "middleware": "all-merchant-request",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58905",
//         "api_path": "/admin/v1/changemerchantstore",
//         "category": "Stores Management",
//         "name": "Update Store Status",
//         "description": "Update Store Status",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.553Z",
//         "middleware": "update-store-status",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58906",
//         "api_path": "/admin/v1/allMerchantStore",
//         "category": "Stores Management",
//         "name": "View All Merchants Stores",
//         "description": "View All Merchants Stores in Admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.554Z",
//         "middleware": "all-merchant-store",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58926",
//         "api_path": "/paymentlink/v1/createFastCode",
//         "category": "Stores Management",
//         "name": "Create Store Fast Code",
//         "description": " ",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.577Z",
//         "middleware": "new-fast-code",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e5",
//         "api_path": "/admin/v1/createMerchantStoreByAdmin",
//         "category": "Stores Management",
//         "name": "Create New Merchant Store by Admin",
//         "description": "Create Merchant New Store by Admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.522Z",
//         "middleware": "new-store-by-admin",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58918",
//         "api_path": "/admin/v1/getAllPoolWallet",
//         "category": "Transactions Management",
//         "name": "View All Pool Wallets",
//         "description": "View All Pool Wallets",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.567Z",
//         "middleware": "all-pool-wallet",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58919",
//         "api_path": "/admin/v1/getTranscationofPoolwallet",
//         "category": "Transactions Management",
//         "name": "View All Transactions by Pool Wallet",
//         "description": "View All Transactions by Pool Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.567Z",
//         "middleware": "all-trans-by-pool-w",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5891a",
//         "api_path": "/admin/v1/update_the_transcation_by_admin",
//         "category": "Transactions Management",
//         "name": "Adjust Transaction Status",
//         "description": "Adjust Transaction Status",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.568Z",
//         "middleware": "adjust-trans-status",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5891e",
//         "api_path": "/admin/v1/get_Payment_History",
//         "category": "Transactions Management",
//         "name": "View Payment History",
//         "description": "View Transaction Payment History",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.572Z",
//         "middleware": "trans-payment-hist",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5891f",
//         "api_path": "/admin/v1/call_the_webhook",
//         "category": "Transactions Management",
//         "name": "Resend Webhook Call",
//         "description": "Resend Webhook Call",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.572Z",
//         "middleware": "resend-trans-webhook",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58920",
//         "api_path": "/admin/v1/get_the_webhook",
//         "category": "Transactions Management",
//         "name": "View Webhook Call History",
//         "description": "View Webhook Call History",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.573Z",
//         "middleware": "view-webhook-hist",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58921",
//         "api_path": "/admin/v1/change_topup_network",
//         "category": "Transactions Management",
//         "name": "Update TopUp Transactions Network",
//         "description": "Change TopUp Transactions Network",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.574Z",
//         "middleware": "update-trans-network",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5891c",
//         "api_path": "/admin/v1/change_the_topuptimespent",
//         "category": "Transactions Management",
//         "name": "Update TopUp Transaction Link Validity",
//         "description": "Update TopUp Transaction Link Validity",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.580Z",
//         "middleware": "update-trans-topup-link",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5887d",
//         "api_path": "/v1/updateMerchantProfileImage",
//         "category": "Impersonate Management",
//         "name": "Edit/Update Merchant Profile",
//         "description": "Edit/Update Merchant Profile",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.419Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5887f",
//         "api_path": "/v1/clientWihdrawLogs",
//         "category": "Impersonate Management",
//         "name": "View All Merchant Withdraw",
//         "description": "View All Merchant Withdraw",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.420Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58885",
//         "api_path": "/v1/merchantsTranscation",
//         "category": "Impersonate Management",
//         "name": "View All Merchant Deposits",
//         "description": "View All Merchant Deposits",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.428Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58882",
//         "api_path": "/v1/getmerchantWallets",
//         "category": "Impersonate Management",
//         "name": "View Merchant Wallet Balance",
//         "description": "View Merchant Wallet Balance",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.433Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5888e",
//         "api_path": "/v1/createMerchantStore",
//         "category": "Impersonate Management",
//         "name": "Create New Merchant Store",
//         "description": "Create New Merchant Store",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.436Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5888f",
//         "api_path": "/v1/merchantstore",
//         "category": "Impersonate Management",
//         "name": "View All Merchant Store",
//         "description": "View All Merchant Store",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.436Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58890",
//         "api_path": "/v1/merchantStoreProfileUpdate",
//         "category": "Impersonate Management",
//         "name": "Edit/Update Merchant Store",
//         "description": "Edit/Update Merchant Store",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.437Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58891",
//         "api_path": "/v1/changemerchantstore",
//         "category": "Impersonate Management",
//         "name": "Update Merchant Store Status",
//         "description": "Update Merchant Store Status",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.438Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58892",
//         "api_path": "/v1/regsiterStoreDevices",
//         "category": "Impersonate Management",
//         "name": "Register Store Devices",
//         "description": "Register Store Devices (PoS)",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.438Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58893",
//         "api_path": "/v1/verifydeviceOTP",
//         "category": "Impersonate Management",
//         "name": "Verify Devices OTP",
//         "description": "Verify Devices OTP",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.439Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58896",
//         "api_path": "/v1/disableordeletedevices",
//         "category": "Impersonate Management",
//         "name": "Disable/Delete Stores Devices",
//         "description": "Disable/Delete Stores Devices",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.441Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58894",
//         "api_path": "/v1/getAllStoreDevices",
//         "category": "Impersonate Management",
//         "name": "View All Stores Devices",
//         "description": "View All Stores Devices",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.447Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588a3",
//         "api_path": "/v1/createClientCategory",
//         "category": "Impersonate Management",
//         "name": "Create Merchant Payment Services",
//         "description": "Create Merchant Payment Services",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.453Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588a6",
//         "api_path": "/v1/cancelClientRequest",
//         "category": "Impersonate Management",
//         "name": "Cancel Client Category Request",
//         "description": "Cancel Client Category Request",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.455Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588ac",
//         "api_path": "/v1/createPerferedNetwork",
//         "category": "Impersonate Management",
//         "name": "Create Merchant Prefered Network",
//         "description": "Create Merchant Prefered Network",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.462Z",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588eb",
//         "api_path": "/admin/v1/createCurrency",
//         "category": "Currencies Management",
//         "name": "Create New Currency",
//         "description": "Create New Currency",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.536Z",
//         "middleware": "new-currency",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588ec",
//         "api_path": "/admin/v1/allCurrency",
//         "category": "Currencies Management",
//         "name": "View All Currencies",
//         "description": "View All Currencies",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.537Z",
//         "middleware": "all-currencies",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588ed",
//         "api_path": "/admin/v1/deleteCurrency",
//         "category": "Currencies Management",
//         "name": "Delete Currency",
//         "description": "Delete Currency",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.537Z",
//         "middleware": "delete-currency",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588ee",
//         "api_path": "/admin/v1/updateCurrency",
//         "category": "Currencies Management",
//         "name": "Edit/Update Currency",
//         "description": "Edit/Update Currency",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.538Z",
//         "middleware": "update-currency",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e1",
//         "api_path": "/admin/v1/resetMerchantTwoFa",
//         "category": "Merchant Management",
//         "name": "Reset Merchant 2FA",
//         "description": "Reset Merchant Google 2FA",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.518Z",
//         "middleware": "reset-merchant-2fa",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e2",
//         "api_path": "/admin/v1/changeMerchantEmail",
//         "category": "Merchant Management",
//         "name": "Edit/Update Merchant",
//         "description": "Edit/Update Merchant Datas",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.519Z",
//         "middleware": "update-merchant",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e3",
//         "api_path": "/admin/v1/changeClientLoginStatus",
//         "category": "Merchant Management",
//         "name": "Update Merchant Login Status",
//         "description": "Update Merchant Login Status",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.520Z",
//         "middleware": "update-merchant-login-status",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e7",
//         "api_path": "/admin/v1/approvekyc",
//         "category": "Merchant Management",
//         "name": "Enable/Disable KYC Status",
//         "description": "Enable/Disable Merchant KYC Status",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.523Z",
//         "middleware": "enable-d-merchant-kyc",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588fd",
//         "api_path": "/admin/v1/allMerchant",
//         "category": "Merchant Management",
//         "name": "View All Merchants",
//         "description": "View All Merchants",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.548Z",
//         "middleware": "all-merchant",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58908",
//         "api_path": "/admin/v1/clientimpersonate",
//         "category": "Merchant Management",
//         "name": "Impersonate User",
//         "description": "Impersonate User",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.555Z",
//         "middleware": "impersonate-merchant",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5890d",
//         "api_path": "/admin/v1/get_all_deposit_client_by_admin",
//         "category": "Merchant Management",
//         "name": "View All Merchant Wallets Balance",
//         "description": "View All Merchant Wallets Balance in admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.558Z",
//         "middleware": "all-merchant-balance",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58915",
//         "api_path": "/admin/v1/create_or_update_clienthotwallets",
//         "category": "Merchant Management",
//         "name": "Create/Update Merchant Hot Wallet",
//         "description": "Create/Update Merchant Hot Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.565Z",
//         "middleware": "create-merchant-hotwallet",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58916",
//         "api_path": "/admin/v1/get_all_clienthotwallets",
//         "category": "Merchant Management",
//         "name": "View All Merchant Hot Wallet",
//         "description": "View All Merchant Hot Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.565Z",
//         "middleware": "all-merchant-hotwallet",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58909",
//         "api_path": "/admin/v1/getClientWalletsForAdmin",
//         "category": "Merchant Management",
//         "name": "View Merchant Wallet Balance",
//         "description": "View Merchant Wallet Balance in admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.556Z",
//         "middleware": "view-merchant-balance",
//         "updatedAt": "2023-01-04T13:25:10.431Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588d2",
//         "api_path": "/hotWallet/v1/allHotWallets",
//         "category": "Hot Wallet Management",
//         "name": "View All Hot Wallets",
//         "description": "View All Hot Wallets",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.513Z",
//         "middleware": "all-hotwallets",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588fe",
//         "api_path": "/admin/v1/get_All_Hot_Wallet_Transcations",
//         "category": "Hot Wallet Management",
//         "name": "View All Hot Wallet Datas",
//         "description": "View All Hot Wallet Datas",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.549Z",
//         "middleware": "all-hotwallet-trans",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58900",
//         "api_path": "/admin/v1/trans_from_pw_to_hw",
//         "category": "Hot Wallet Management",
//         "name": "Transfer From PW to HW",
//         "description": "Transfer From Pool Wallet to Hot Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.550Z",
//         "middleware": "transf-from-pw-hw",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58901",
//         "api_path": "/admin/v1/trans_from_fw_pw_to_hw",
//         "category": "Hot Wallet Management",
//         "name": "Transfer From FPW to HW",
//         "description": "Transfer From Feed. Pool Wallet to Hot Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.551Z",
//         "middleware": "transf-from-fpw-hw",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58904",
//         "api_path": "/admin/v1/confirm_the_pw_to_hw",
//         "category": "Hot Wallet Management",
//         "name": "Confirm From PW to HW",
//         "description": "Confirm Transfer From Pool Wallet to Hot Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.552Z",
//         "middleware": "conf-transf-from-pw-hw",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58902",
//         "api_path": "/admin/v1/trans_fm_FDW_To_PW",
//         "category": "Hot Wallet Management",
//         "name": "Transfer From FW to PW",
//         "description": "Transfer From Feed. Wallet to Pool allet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.560Z",
//         "middleware": "transf-from-fw-pw",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588d5",
//         "api_path": "/admin/v1/signupadmin",
//         "category": "Admin Management",
//         "name": "Create New User Admin",
//         "description": "Create New User Admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.505Z",
//         "middleware": "new-admin",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588db",
//         "api_path": "/admin/v1/allAdmin",
//         "category": "Admin Management",
//         "name": "View All Users Admin",
//         "description": "View All Users Admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.510Z",
//         "middleware": "all-admin",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588df",
//         "api_path": "/admin/v1/updatePassword",
//         "category": "Admin Management",
//         "name": "Reset User Password",
//         "description": "Reset User Password",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.515Z",
//         "middleware": "reset-admin-pass",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e0",
//         "api_path": "/admin/v1/resettwofa",
//         "category": "Admin Management",
//         "name": "Reset User 2FA",
//         "description": "Reset User Google 2FA",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.516Z",
//         "middleware": "reset-admin-2fa",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588e4",
//         "api_path": "/admin/v1/changeAdminsLoginStatus",
//         "category": "Admin Management",
//         "name": "Edit/Update Login Status",
//         "description": "Edit/Update Login Status",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.521Z",
//         "middleware": "update-admin-login-status",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58917",
//         "api_path": "/admin/v1/updateadminrole",
//         "category": "Admin Management",
//         "name": "Update Admin User Role",
//         "description": "Update Admin User Role",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.566Z",
//         "middleware": "update-admin-role",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588be",
//         "api_path": "/network/v1/createNetwork",
//         "category": "Networks Management",
//         "name": "Create New Network",
//         "description": "Create new network using admin panel",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.479Z",
//         "middleware": "new-network",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588bf",
//         "api_path": "/network/v1/allNetwork",
//         "category": "Networks Management",
//         "name": "View All Networks",
//         "description": "Display all network list in admin panel",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.483Z",
//         "middleware": "all-networks",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588c0",
//         "api_path": "/network/v1/updateNetwork",
//         "category": "Networks Management",
//         "name": "Edit Network",
//         "description": "Update network data using admin panel",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.484Z",
//         "middleware": "update-network",
//         "updatedAt": "2023-01-04T13:25:10.432Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588c1",
//         "api_path": "/network/v1/deleteNetwork",
//         "category": "Networks Management",
//         "name": "Delete Network",
//         "description": "Delete network data using admin panel",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.485Z",
//         "middleware": "delete-network",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588c2",
//         "api_path": "/network/v1/changeStatusNetwork",
//         "category": "Networks Management",
//         "name": "Disable/Enable Network",
//         "description": "Change network status using admin panel",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.486Z",
//         "middleware": "update-network-status",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588c3",
//         "api_path": "/network/v1/changeHotWalletStatusLimit",
//         "category": "Networks Management",
//         "name": "Change Hot Wallet Transfer Mode",
//         "description": "Change Hot Wallet Transfer Mode Auto/Manual",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.487Z",
//         "middleware": "update-hw-transf-mode",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5887e",
//         "api_path": "/v1/withdraw",
//         "category": "Withdraw Management",
//         "name": "Create New Withdraw request",
//         "description": "Create New Withdraw request in merchant account",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.420Z",
//         "middleware": "new-withdraw-in-merchant",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58881",
//         "api_path": "/v1/clientwithdrawnetworkid",
//         "category": "Withdraw Management",
//         "name": "View Withdraw by Network",
//         "description": "View Withdraw by Network in merchant account",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.422Z",
//         "middleware": "withdraw-by-network",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588d3",
//         "api_path": "/withdraw/v1/updateWithdrawRequest",
//         "category": "Withdraw Management",
//         "name": "Approve/Cancel Withdraw Request",
//         "description": "Approve/Cancel Withdraw Request in admin panel",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.503Z",
//         "middleware": "approve-c-withdraw",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588d4",
//         "api_path": "/withdraw/v1/withdrawListByNetworkID",
//         "category": "Withdraw Management",
//         "name": "Filter Withdraw by Network",
//         "description": "Filter Withdraw by Network",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.504Z",
//         "middleware": "withdraw-by-network",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588da",
//         "api_path": "/admin/v1/get_admin_withdraw",
//         "category": "Withdraw Management",
//         "name": "View All Merchants Withdraw",
//         "description": "View All Merchants Withdraw (In Admin)",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.509Z",
//         "middleware": "all-merchant-withdraw",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5891b",
//         "api_path": "/admin/v1/update_withdraw_limit",
//         "category": "Withdraw Management",
//         "name": "Update User Withdraw Limit",
//         "description": "Update User Withdraw Limit",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.569Z",
//         "middleware": "update-user-withdraw-limit",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588cb",
//         "api_path": "/wallet/v1/allPoolWallet",
//         "category": "Pool Wallet Management",
//         "name": "View Pool Wallet Balance",
//         "description": "View Pool Wallet Balance",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.496Z",
//         "middleware": "view-all-pw-balance",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588ce",
//         "api_path": "/wallet/v1/getUsedPercentage",
//         "category": "Pool Wallet Management",
//         "name": "View Pool Wallet Usage",
//         "description": "View Pool Wallet Usage Statistics",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.498Z",
//         "middleware": "view-pw-statistic",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f588cf",
//         "api_path": "/wallet/v1/createBulkPoolWallet",
//         "category": "Pool Wallet Management",
//         "name": "Create Bulk Pool Wallet",
//         "description": "Create New Bulk Pool Wallet",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.499Z",
//         "middleware": "new-bulk-pw",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58903",
//         "api_path": "/admin/v1/pool_wallet_balance",
//         "category": "Pool Wallet Management",
//         "name": "View Pool Wallet Balance",
//         "description": "View Pool Wallet Balance",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.611Z",
//         "middleware": "view-pw-balance",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5890b",
//         "api_path": "/admin/v1/get_all_invoice_for_admin",
//         "category": "Invoices Management",
//         "name": "View All Invoices In Admin",
//         "description": "View All Invoices By Admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.557Z",
//         "middleware": "all-invoices",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5890c",
//         "api_path": "/admin/v1/updateInvoiceByAdmin",
//         "category": "Invoices Management",
//         "name": "Update Invoice Status",
//         "description": "Update Invoice Status by Admin",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.557Z",
//         "middleware": "update-invoice-status",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58922",
//         "api_path": "/paymentlink/v1/storeInvoice",
//         "category": "Invoices Management",
//         "name": "Create New Invoice",
//         "description": "Create New Invoice In merchant account",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.575Z",
//         "middleware": "new-merchant-invoice",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58923",
//         "api_path": "/paymentlink/v1/paymentLink",
//         "category": "Invoices Management",
//         "name": "Generate Payment Link",
//         "description": "Generate Payment Link in merchant account",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.575Z",
//         "middleware": "get-payment-link",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f58924",
//         "api_path": "/paymentlink/v1/getAllInvoices",
//         "category": "Invoices Management",
//         "name": "View All Invoices",
//         "description": "View All Invoices in merchant account",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.576Z",
//         "middleware": "all-merchant-invoice",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     },
//     {
//         "_id": "63b537d7298fc34951f5892a",
//         "api_path": "/paymentlink/v1/deleteInvoice",
//         "category": "Invoices Management",
//         "name": "Delete Invoice",
//         "description": "Delete Invoice in merchant account",
//         "status": 1,
//         "__v": 0,
//         "createdAt": "2023-01-04T08:24:55.582Z",
//         "middleware": "delete-merchant-invoice",
//         "updatedAt": "2023-01-04T13:25:10.433Z"
//     }
       
// ]
const updating = [

    {
        "_id": "63b537d7298fc34951f58909",
        "api_path": "/admin/v1/getClientWalletsForAdmin",
        "category": "Merchant Management",
        "name": "View Merchant Wallet Balance",
        "description": "View Merchant Wallet Balance in admin",
        "status": 1,
        "__v": 0,
        "createdAt": "2023-01-04T08:24:55.556Z",
        "middleware": "view-merchant-balance",
        "updatedAt": "2023-01-04T13:25:10.431Z"
    },
    {
        "_id": "",
        "api_path": "/admin/v1/getTransForAdmin",
        "category": "Transactions Management",
        "name": "View all Deposits Transactions",
        "description": "View all Deposits Transactions (TOPUP - PayLink - API - PoS)",
        "status": 1,
        "__v": 0,
        "createdAt": "2023-01-04T08:24:55.580Z",
        "middleware": "view-all-deposits",
        "updatedAt": "2023-01-04T13:25:10.432Z"
    }
]
module.exports =
{
  transid: transid,
  addressBalance: addressBalance,
  GAS_ABI: GAS_ABI,
  address: address,
  block: block,
  index: index,
  translists: [],
  interval: interval,
  kyc_path1: kyc_path1,
  kyc_path2: kyc_path2,
  kyc_path3: kyc_path3,
  kycapplication: kycapplication,
  kycindex: kycindex,
  kyc_levels: kyc_levels,
  web_hook_link: web_hook_link,
  kycinterval: kycinterval,
  abi: abi,
  USDT_ABI: USDT_ABI,
  posTransList: posTransList,
  postransindex: postransindex,
  paymenlinkTransList: paymenlinkTransList,
  paymenlinkIndex: paymenlinkIndex,
  transstatus: transstatus,
  topupTransList :topupTransList,
  topupIndex :topupIndex,
  ALL_API : ALL_API,
  CATEGORY : CATEGORY,
  updating : updating,

}