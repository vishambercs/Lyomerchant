// var express                         = require('express');
// var router                          = express.Router();
// const transcationpoolController     = require('../controllers/transcationpoolController');
// const clientsController             = require('../controllers/clientsController');
// const poolController                = require('../controllers/poolController');
// const withdrawController            = require('../controllers/withdrawController');
// const kycwebhooklogController       = require('../controllers/kycwebhooklogController');
// const hotwallettranslogsController  = require('../controllers/hotwallettranslogsController');
// const merchantstoreController       = require('../controllers/POS/merchantstoreController');
// const posTransactionPoolController  = require('../controllers/POS/posTransactionPoolController');
// const CurrencyController            = require('../controllers/Masters/CurrencyController');
 const networkController             = require('../controllers/networkController');
// const Auth                          = require('../Validation/Auth');

// router.post('/assignMerchantWallet',                 Auth.Verfiy_Merchant,transcationpoolController.assignMerchantWallet);
// router.post('/merchantsTranscation',                 Auth.is_merchant,Auth.Verfiy_Merchant,transcationpoolController.getTrans);
// router.post('/Get_Transcation_From_Address',         clientsController.Get_Transcation_From_Address);
// router.post('/check_balance_api',                    Auth.is_merchant,transcationpoolController.check_balance_api);
// router.post('/createMerchant',                       Auth.is_merchant,clientsController.create_clients);
// router.post('/signUpMerchant',                       clientsController.create_merchant);
// router.post('/login',                                clientsController.Login);
// router.post('/verfiyMerchantAuth',                   Auth.is_merchant,clientsController.Verfiy_Google_Auth);
// router.post('/clientBalance',                        Auth.is_merchant,transcationpoolController.get_Client_Balance);
// router.post('/withdraw',                             Auth.is_merchant,withdrawController.save_withdraw);
// router.post('/clientWihdrawLogs',                    Auth.is_merchant,withdrawController.get_client_wihdraw);
// router.post('/clientTotalWihdraw',                   Auth.is_merchant,withdrawController.get_client_wihdraw_total);
// router.post('/getBalanceAddress',                    Auth.is_merchant,clientsController.get_BalancebyAddress);
// router.post('/approvekyc',                           Auth.is_merchant,clientsController.kyc_approved);
// router.post('/getmerchantWallets',                   Auth.is_merchant,clientsController.getClientWallets);
// router.post('/update_cron_job',                      Auth.is_merchant,clientsController.update_cron_job);
// router.post('/merchantNetworkTranscation',           Auth.is_merchant,transcationpoolController.get_Trans_by_Network_ID);
// router.post('/gettranscationlist',                   Auth.is_merchant,clientsController.Get_Transcation_List);
// router.post('/check_kyc',                            Auth.is_merchant,clientsController.check_kyc);
// router.post('/createkyclink',                        Auth.is_merchant,clientsController.Create_Kyc_Link);
// router.post('/kycstatus',                            Auth.Verfiy_Kyc_Header,clientsController.kyc_verification_status);
// router.post('/kycLevels',                            Auth.is_merchant,clientsController.clients_kyc_levels);
// router.post('/webHookLog',                           Auth.is_merchant,kycwebhooklogController.getkycWebHookLog);
// router.post('/resendingemail',                       Auth.is_merchant,clientsController.resendingemail);
// router.post('/verfiyemail',                          Auth.is_merchant,clientsController.verfiyemail);
// // router.post('/allMerchant',                          clientsController.allMerchant);
// router.post('/customerstatus',                       Auth.is_merchant,clientsController.customerstatus);

// router.post('/resetMerchantTwoFa',                   Auth.is_merchant,clientsController.reset_merchant_two_fa);
// router.post('/clientwithdrawnetworkid',              Auth.is_merchant,withdrawController.get_client_withdraw_with_network_id);
// router.post('/updateClientToken',                    Auth.is_merchant,clientsController.updateClientToken);
// router.post('/getTranscationData',                   Auth.is_merchant,hotwallettranslogsController.getTranscationData);
// router.post('/transactionDetailsClient',             Auth.is_merchant,transcationpoolController.get_Trans_by_txId);
// router.post('/transactionFastDetails',               Auth.paylink_have_access,transcationpoolController.get_Fastlink_Trans_by_txId);


// router.post('/generateNewClientAddress',             Auth.is_merchant,clientsController.generateNewClientAddress);
// router.post('/forgotPassword',                       clientsController.forgotPassword);
// router.post('/tokenAndUpdatePassword',               Auth.is_merchant,clientsController.checkTheTokenAndUpdatePassword);
// router.post('/resetPassword',                        clientsController.ResetPassword);
// router.post('/updateMerchantProfileImage',           Auth.is_merchant,clientsController.updateMerchantProfileImage);

// // router.post('/resetMerchantTwoFa',                clientsController.reset_merchant_two_fa);
// // router.post('/clientwithdrawnetworkid',           withdrawController.get_client_withdraw_with_network_id);
// // router.post('/updateClientToken',                 clientsController.updateClientToken);
// // router.post('/getTranscationData',                hotwallettranslogsController.getTranscationData);

// // =============MerchantStore=========================================== //
// router.post('/createMerchantStore',                  Auth.is_merchant,merchantstoreController.createMerchantStore);
// router.get('/allMerchantStore',                      Auth.is_merchant,merchantstoreController.allMerchantStore);
// router.post('/merchantstore',                        Auth.is_merchant,merchantstoreController.MerchantStore);

// // =============Pos Merchant Wallet=========================================== //
// router.post('/assignPosMerchantWallet',                 Auth.store_have_access,posTransactionPoolController.assignPosMerchantWallet);
// router.post('/shopTransList',                           Auth.store_have_access,posTransactionPoolController.getShopTransList);

// "============================ Currency Master ==============================="
// router.get('/allCurrency',                           Auth.is_merchant,CurrencyController.allCurrency);
// router.post('/priceConversition',                    Auth.is_merchant,CurrencyController.priceConversition);


// "============================ NETWORK Master ==============================="
// router.post('/allNetworks',                             Auth.is_merchant,networkController.allNetworkForClient);

// module.exports = router;





var express                         = require('express');
var router                          = express.Router();
const transcationpoolController     = require('../controllers/transcationpoolController');
const clientsController             = require('../controllers/clientsController');
const poolController                = require('../controllers/poolController');
const withdrawController            = require('../controllers/withdrawController');
const kycwebhooklogController       = require('../controllers/kycwebhooklogController');
const hotwallettranslogsController  = require('../controllers/hotwallettranslogsController');
const merchantstoreController       = require('../controllers/POS/merchantstoreController');
const posTransactionPoolController  = require('../controllers/POS/posTransactionPoolController');
const CurrencyController            = require('../controllers/Masters/CurrencyController')
const Auth                          = require('../Validation/Auth');

router.post('/assignMerchantWallet',                 Auth.Verfiy_Merchant,transcationpoolController.assignMerchantWallet);
router.post('/merchantsTranscation',                 Auth.Verfiy_Merchant,transcationpoolController.getTrans);
router.post('/Get_Transcation_From_Address',         clientsController.Get_Transcation_From_Address);
router.post('/check_balance_api',                    transcationpoolController.check_balance_api);
router.post('/createMerchant',                       clientsController.create_clients);
router.post('/signUpMerchant',                       clientsController.create_merchant);
router.post('/login',                                clientsController.Login);
router.post('/verfiyMerchantAuth',                   clientsController.Verfiy_Google_Auth);
router.post('/clientBalance',                        transcationpoolController.get_Client_Balance);
router.post('/withdraw',                             withdrawController.save_withdraw);
router.post('/clientWihdrawLogs',                    withdrawController.get_client_wihdraw);
router.post('/clientTotalWihdraw',                   withdrawController.get_client_wihdraw_total);
router.post('/getBalanceAddress',                    clientsController.get_BalancebyAddress);
router.post('/approvekyc',                           clientsController.kyc_approved);
router.post('/getmerchantWallets',                   clientsController.getClientWallets);
router.post('/update_cron_job',                      clientsController.update_cron_job);
router.post('/merchantNetworkTranscation',           transcationpoolController.get_Trans_by_Network_ID);
router.post('/gettranscationlist',                   clientsController.Get_Transcation_List);
router.post('/check_kyc',                            clientsController.check_kyc);
router.post('/createkyclink',                        clientsController.Create_Kyc_Link);
router.post('/kycstatus',                            Auth.Verfiy_Kyc_Header,clientsController.kyc_verification_status);
router.post('/kycLevels',                            clientsController.clients_kyc_levels);
router.post('/webHookLog',                           kycwebhooklogController.getkycWebHookLog);
router.post('/resendingemail',                       clientsController.resendingemail);
router.post('/verfiyemail',                          clientsController.verfiyemail);
// router.post('/allMerchant',                          clientsController.allMerchant);
router.post('/customerstatus',                       clientsController.customerstatus);

router.post('/resetMerchantTwoFa',                   clientsController.reset_merchant_two_fa);
router.post('/clientwithdrawnetworkid',              withdrawController.get_client_withdraw_with_network_id);
router.post('/updateClientToken',                    clientsController.updateClientToken);
router.post('/getTranscationData',                   hotwallettranslogsController.getTranscationData);
router.post('/transactionDetailsClient',             transcationpoolController.get_Trans_by_txId);
router.post('/transactionFastDetails',               Auth.paylink_have_access,transcationpoolController.get_Fastlink_Trans_by_txId);


router.post('/generateNewClientAddress',             clientsController.generateNewClientAddress);
router.post('/forgotPassword',                       clientsController.forgotPassword);
router.post('/tokenAndUpdatePassword',               clientsController.checkTheTokenAndUpdatePassword);
router.post('/resetPassword',                        clientsController.ResetPassword);
router.post('/updateMerchantProfileImage',           clientsController.updateMerchantProfileImage);

// router.post('/resetMerchantTwoFa',                clientsController.reset_merchant_two_fa);
// router.post('/clientwithdrawnetworkid',           withdrawController.get_client_withdraw_with_network_id);
// router.post('/updateClientToken',                 clientsController.updateClientToken);
// router.post('/getTranscationData',                hotwallettranslogsController.getTranscationData);

// =============MerchantStore=========================================== //
router.post('/createMerchantStore',                  merchantstoreController.createMerchantStore);
router.get('/allMerchantStore',                      merchantstoreController.allMerchantStore);
router.post('/merchantstore',                        merchantstoreController.MerchantStore);

// =============Pos Merchant Wallet=========================================== //
router.post('/assignPosMerchantWallet',                posTransactionPoolController.assignPosMerchantWallet);
router.post('/shopTransList',                           posTransactionPoolController.getShopTransList);

//============================ Currency Master ==============================//
router.get('/allCurrency',                                   CurrencyController.allCurrency);
router.post('/priceConversition',                            CurrencyController.priceConversition);

//============================ Merchant Withdraw ==============================//
router.post('/merchantBalance',                                  withdrawController.merchantBalance);
router.post('/setWithdrawSettings',                              withdrawController.setWithdrawSettings);
router.get('/getWithdrawSettings',                               withdrawController.getWithdrawSettings);
router.post('/setMerchantWitthdrawMode',                         withdrawController.setMerchantWitthdrawMode);
router.post('/setMerchantWitthdrawLimit',                        withdrawController.setMerchantWitthdrawLimit);
router.post('/setMerchantWitthdrawFeePercentage',                withdrawController.setMerchantWitthdrawFeePercentage);
router.post('/setPooltoHotMode',                                 withdrawController.setPooltoHotMode);
router.post('/setPooltoHotLimit',                                withdrawController.setPooltoHotLimit);
router.post('/merchantWithdrawBalance',                          withdrawController.withdrawBalance);
router.get('/getGasFee',                                         withdrawController.getGasFee);








"============================ NETWORK Master ==============================="
router.post('/allNetworks',                             networkController.allNetworkForClient);

module.exports = router;




