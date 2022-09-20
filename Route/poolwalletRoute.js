
var express = require('express');
var router = express.Router();
const poolwalletController = require('../controllers/poolwalletController');
const Auth = require('../Validation/Auth');

router.post('/createPoolWallet',                Auth.is_admin,poolwalletController.create_Pool_Wallet);
router.get('/allPoolWallet',                    Auth.is_admin,poolwalletController.all_pool_wallet);
router.post('/create_Pool_Wallet_100',          Auth.is_admin,poolwalletController.create_Pool_Wallet_100);
router.post('/getPoolWalletWithBalance',        Auth.is_admin,poolwalletController.getPoolWalletWithBalance);
router.post('/getUsedPercentage',               Auth.is_admin,poolwalletController.getUsedPercentage);
router.post('/createBulkPoolWallet',            Auth.is_admin,poolwalletController.create_bulk_pool_wallet);
router.post('/allwalletsWithStatus',            Auth.is_admin,poolwalletController.allwalletsWithStatus);
router.post('/generateThePoolWalletAddress',    Auth.is_admin,poolwalletController.generateThePoolWalletAddress);
module.exports = router;
