// var express = require('express');
// var router = express.Router();
// const poolwalletController = require('../controllers/poolwalletController');
// const Auth = require('../Validation/Auth');

// router.post('/createPoolWallet',         Auth.is_admin,poolwalletController.create_Pool_Wallet);
// router.get('/allPoolWallet',             Auth.is_admin,poolwalletController.all_pool_wallet);
// router.post('/create_Pool_Wallet_100',   Auth.is_admin,poolwalletController.create_Pool_Wallet_100);
// router.post('/getPoolWalletWithBalance', Auth.is_admin,poolwalletController.getPoolWalletWithBalance);
// router.post('/getUsedPercentage',        Auth.is_admin,poolwalletController.getUsedPercentage);
// router.post('/createBulkPoolWallet',     Auth.is_admin,poolwalletController.create_bulk_pool_wallet);
// module.exports = router;


var express = require('express');
var router = express.Router();
const poolwalletController = require('../controllers/poolwalletController');
const Auth = require('../Validation/Auth');

router.post('/createPoolWallet',         poolwalletController.create_Pool_Wallet);
router.get('/allPoolWallet',             poolwalletController.all_pool_wallet);
router.post('/create_Pool_Wallet_100',   poolwalletController.create_Pool_Wallet_100);
router.post('/getPoolWalletWithBalance', poolwalletController.getPoolWalletWithBalance);
router.post('/getUsedPercentage',        poolwalletController.getUsedPercentage);
router.post('/createBulkPoolWallet',     poolwalletController.create_bulk_pool_wallet);
module.exports = router;
