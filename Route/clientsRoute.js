

var express = require('express');
var router = express.Router();
const transcationpoolController = require('../controllers/transcationpoolController');
const clientsController = require('../controllers/clientsController');
const poolController = require('../controllers/poolController');
const withdrawController = require('../controllers/withdrawController');
const Auth = require('../Validation/Auth');
router.post('/assignMerchantWallet',            Auth.Verfiy_Merchant,transcationpoolController.assignMerchantWallet);
router.post('/merchantsTranscation',            Auth.Verfiy_Merchant,transcationpoolController.getTrans);
router.post('/Get_Transcation_From_Address',    clientsController.Get_Transcation_From_Address);
router.post('/check_balance_api',               transcationpoolController.check_balance_api);
router.post('/createMerchant',                  clientsController.create_clients);
router.post('/signUpMerchant',                  clientsController.create_merchant);
router.post('/login',                           clientsController.Login);
router.post('/verfiyMerchantAuth',              clientsController.Verfiy_Google_Auth);
router.post('/clientBalance',                   transcationpoolController.get_Client_Balance);
router.post('/withdraw',                        withdrawController.save_withdraw);
router.post('/clientWihdrawLogs',               withdrawController.get_client_wihdraw);
router.post('/clientTotalWihdraw',              withdrawController.get_client_wihdraw_total);
router.post('/getBalanceAddress',               clientsController.get_BalancebyAddress);
router.post('/approvekyc',                      clientsController.kyc_approved);
router.post('/getmerchantWallets',              clientsController.getClientWallets);
router.post('/update_cron_job',                 clientsController.update_cron_job);
router.post('/merchantNetworkTranscation',      transcationpoolController.get_Trans_by_Network_ID);
router.post('/gettranscationlist',              clientsController.Get_Transcation_List);
router.post('/check_kyc',                       clientsController.check_kyc);
router.post('/createkyclink',                 clientsController.Create_Kyc_Link);

module.exports = router;
