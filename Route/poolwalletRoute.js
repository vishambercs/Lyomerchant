var express = require('express');
var router = express.Router();
const poolwalletController = require('../controllers/poolwalletController');
const Auth = require('../Validation/Auth');

router.post('/createPoolWallet',poolwalletController.create_Pool_Wallet);
router.get('/allPoolWallet',poolwalletController.all_pool_wallet);
router.post('/create_Pool_Wallet_100',poolwalletController.create_Pool_Wallet_100);
router.post('/getPoolWalletWithBalance',poolwalletController.getPoolWalletWithBalance);

module.exports = router;
