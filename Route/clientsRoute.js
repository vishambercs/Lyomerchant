var express                         = require('express');
var router                          = express.Router();
const networkController             = require('../controllers/networkController');
const transcationpoolController     = require('../controllers/transcationpoolController');
const clientsController             = require('../controllers/clientsController');
const poolController                = require('../controllers/poolController');
const withdrawController            = require('../controllers/withdrawController');
const kycwebhooklogController       = require('../controllers/kycwebhooklogController');
const hotwallettranslogsController  = require('../controllers/hotwallettranslogsController');
const merchantstoreController       = require('../controllers/POS/merchantstoreController');
const posTransactionPoolController  = require('../controllers/POS/posTransactionPoolController');
const merchantStoreDeviceController = require('../controllers/POS/merchantStoreDeviceController');
const CurrencyController            = require('../controllers/Masters/CurrencyController');
const merchantSitesController       = require('../controllers/Website/merchantSitesController');
const Auth                          = require('../Validation/Auth');
const categoryController            = require('../controllers/Masters/categoryController');
const merchantcategory              = require('../controllers/Masters/merchantcategoryController');
const perferedNetworkController     = require('../controllers/Masters/perferedNetworkController');
const PaymentHostedController       = require('../controllers/hostedpayment/PaymentHostedController');
const clientapicontroller           = require('../controllers/Masters/clientapicontroller');
const commonController              = require('../controllers/Logs/commonController');
const ipnController                 = require('../controllers/Masters/ipnController');
const topupcontroller               = require('../controllers/topup/topupcontroller');
const fixedtopupcontroller          = require('../controllers/topup/fixedtopupcontroller');


router.post('/signUpMerchant',                       Auth.verify_create_merchant_auth,clientsController.create_merchant);
router.post('/resendingemail',                       Auth.is_merchant,Auth.verify_resendingemail,clientsController.resendingemail);
router.post('/verfiyemail',                          Auth.verify_verfiyemail,clientsController.verfiyemail);
router.post('/verifyAuthToken',                      Auth.verify_verfiyemail,clientsController.verifyAuthToken);

router.post('/login',                                Auth.verify_Login,clientsController.Login);
router.post('/verfiyMerchantAuth',                   Auth.verifymerchant,Auth.verify_MerchantAuth,clientsController.Verfiy_Google_Auth);
router.post('/getclientkey',                         Auth.verifymerchant,Auth.verify_getclientkey,clientsController.getclientkey);
router.post('/forgotPassword',                       Auth.verify_forgotPassword,clientsController.forgotPassword);
router.post('/tokenAndUpdatePassword',               Auth.verify_checkTheTokenAndUpdate,clientsController.checkTheTokenAndUpdatePassword);
router.post('/resetPassword',                        Auth.is_merchant, Auth.verify_ResetPassword, clientsController.ResetPassword);
router.post('/updateMerchantProfileImage',           Auth.is_merchant,Auth.verify_updateMerchantProfileImage, clientsController.updateMerchantProfileImage);

"============================ Withdraw ==============================="

router.post('/withdraw',                             Auth.is_merchant,Auth.verify_withdraw,withdrawController.save_withdraw);
router.post('/clientWihdrawLogs',                    Auth.is_merchant,withdrawController.get_client_wihdraw);
router.post('/clientTotalWihdraw',                   Auth.is_merchant,withdrawController.get_client_wihdraw_total);
router.post('/clientwithdrawnetworkid',              Auth.is_merchant,withdrawController.get_client_withdraw_with_network_id);
router.post('/getmerchantWallets',                   Auth.is_merchant,clientsController.getClientWallets);
router.post('/merchantNetworkTranscation',           Auth.is_merchant,Auth.verify_trans_by_network_id,transcationpoolController.get_Trans_by_Network_ID);
router.post('/merchantsTranscation',                 Auth.is_merchant,transcationpoolController.getTrans);
router.post('/check_kyc',                            Auth.is_merchant,clientsController.check_kyc);
router.post('/createkyclink',                        Auth.is_merchant,clientsController.Create_Kyc_Link);
router.post('/kycstatus',                            Auth.Verfiy_Kyc_Header,clientsController.kyc_verification_status);
router.post('/kycLevels',                            Auth.is_merchant,clientsController.clients_kyc_levels);
router.post('/webHookLog',                           Auth.is_merchant,kycwebhooklogController.getkycWebHookLog);
// router.post('/resetMerchantTwoFa',                Auth.is_merchant,clientsController.reset_merchant_two_fa);
// router.post('/getTranscationData',                Auth.is_merchant,hotwallettranslogsController.getTranscationData);
router.post('/transactionDetailsClient',             Auth.is_merchant,transcationpoolController.get_Trans_by_txId);
router.post('/transactionFastDetails',               Auth.fastpay_have_access,transcationpoolController.get_Fastlink_Trans_by_txId);
router.post('/transactionPaylinkDetails',            Auth.paylink_have_access,transcationpoolController.get_Fastlink_Trans_by_txId);
"=============MerchantStore==========================================="
router.post('/createMerchantStore',                  Auth.is_merchant,Auth.has_Pos_Access,Auth.verify_createMerchantStore,merchantstoreController.createMerchantStore);
router.post('/merchantstore',                        Auth.is_merchant,Auth.has_Pos_Access,merchantstoreController.MerchantStore);
router.post('/merchantStoreProfileUpdate',           Auth.is_merchant,Auth.has_Pos_Access,Auth.verify_updateMerchantStoreProfile,merchantstoreController.updateMerchantStoreProfile);
router.post('/changemerchantstore',                  Auth.is_merchant,Auth.has_Pos_Access,merchantstoreController.changeMerchantStore);
router.post('/regsiterStoreDevices',                 Auth.store_have_access,merchantStoreDeviceController.regsiterStoreDevices);
router.post('/verifydeviceOTP',                      Auth.store_have_access,merchantStoreDeviceController.verifyDeviceOTP);
router.post('/getAllStoreDevices',                   Auth.store_have_access,merchantStoreDeviceController.getAllStoreDevice);
router.post('/getAllStoreDeviceForMerchantAdmin',    Auth.is_merchant,merchantStoreDeviceController.getAllStoreDeviceForAdmin);
router.post('/disableordeletedevices',               Auth.store_have_access,merchantStoreDeviceController.disableordelete);
router.post('/posGetTransByStorekey',                Auth.store_have_access,posTransactionPoolController.getTranscationDetailsByStoreID);
router.post('/getallclientstoredevices',             Auth.is_merchant,merchantStoreDeviceController.getAllClientStoreDevices);
"=============Pos Merchant Wallet==========================================="
router.post('/assignPosMerchantWallet',              Auth.check_Store_Device_Access,posTransactionPoolController.assignPosMerchantWallet);
router.post('/shopTransList',                        Auth.check_Store_Device_Access,posTransactionPoolController.getShopTransList);
router.get('/posallCurrency',                        Auth.check_Store_Device_Access,CurrencyController.allCurrency);
router.post('/pospriceConversition',                 Auth.check_Store_Device_Access,CurrencyController.priceConversitionPosChanges);
router.post('/posallNetworks',                       Auth.check_Store_Device_Access,networkController.allNetworkForPOSClient);
router.post('/posGetTransByDeviceID',                Auth.check_Store_Device_Access,posTransactionPoolController.getTranscationDetailsByDeviceID);
"============================ Currency Master ==============================="
router.get('/allCurrency',                           CurrencyController.allCurrency);
router.post('/priceConversition',                    CurrencyController.priceConversition);

"============================ NETWORK Master ==============================="

router.post('/allNetworks',                          Auth.is_merchant,networkController.allNetworkForClient);

"============================ Category Master ==============================="

router.post('/createClientCategory',                 Auth.is_merchant,merchantcategory.createClientCategory);
router.get('/allcategory',                           Auth.is_merchant,categoryController.allcategory);
router.get('/getClientCategory',                     Auth.is_merchant,merchantcategory.getClientCategory);
router.post('/cancelClientRequest',                  Auth.is_merchant,merchantcategory.cancelClientRequest);

"============================ WEB PLUGIN ==============================="

router.post('/assignMerchantWallet',                 Auth.Verfiy_Merchant,Auth.plugin_have_access,transcationpoolController.assignMerchantWallet);
// router.post('/pluginallNetworks',                    Auth.Verfiy_Merchant,Auth.checkaccess,networkController.allPreferedeNetworkForClient);
router.post('/pluginallCurrency',                    Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.allCurrency);
router.post('/pluginpriceConversition',              Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.priceConversitionChanges);


"============================ Withdraw  ==============================="

router.post('/merchantBalance',                      Auth.is_merchant,withdrawController.merchantBalance);
router.post('/merchantWithdrawBalance',              Auth.is_merchant,withdrawController.withdrawBalance);

"============================ perfered Network Controller  ==============================="

router.post('/createPerferedNetwork',                Auth.is_merchant,perferedNetworkController.create_perfered_Network);
router.post('/getPerferedNetwork',                   Auth.is_merchant,perferedNetworkController.get_perfered_Network);

"============================ HOSTRED PAYMENT  ==============================="

router.post('/createHostePayment',                   Auth.paylink_have_access,Auth.verify_variables,PaymentHostedController.createHostePayment);
router.post('/ipntesting',                           PaymentHostedController.IPN_Testing);

"============================ Common Controller  ==============================="
router.post('/getTransStatus',                       Auth.checkaccess,commonController.getTransStatus);
router.get('/getalltranscationofmerchant',           Auth.is_merchant,commonController.getAllTranscationOfMerchant);


"============================ Assign Top up Merchant Wallet  ==============================="
// router.post('/assigntopupMerchantWallet',                 Auth.Verfiy_Merchant,Auth.plugin_have_access,transcationpoolController.assignMerchantWalletForTopUP);

// router.post('/getTranscationDataofTopup',transcationpoolController.getTranscationDataofTopup);
// router.post('/canceltopup',transcationpoolController.cancelpaymentLink);

"============================IPN Controller==============================="
router.post('/createIPNLink',                        Auth.is_merchant,ipnController.create_IPN_Link);
router.post('/getIPNLink',                           Auth.is_merchant,ipnController.get_IPN_Link);

"============================Create Top UP==============================="
router.post('/assigntopupMerchantWallet',   topupcontroller.create_top_payment);
router.post('/pluginallNetworks',           Auth.Verfiy_Merchant,Auth.checkaccess,networkController.allPreferedeNetworkForClient);
router.post('/getTranscationDataofTopup',   topupcontroller.get_top_payment_data);
router.post('/canceltopup',                 topupcontroller.cancelpaymentLink);
router.post('/checkbalance',                topupcontroller.checkbalance);
router.post('/verfiytranshash',             topupcontroller.verfiytranshash);
router.post('/sendotp',                     topupcontroller.sendotp);
router.post('/updatetrans',                 topupcontroller.updatetrans);


"============================Create Fixed Top UP==============================="
router.post('/fixedassigntopupMerchantWallet',   fixedtopupcontroller.create_top_payment);
router.post('/fixedpluginallNetworks',           Auth.Verfiy_Merchant,Auth.checkaccess,networkController.allPreferedeNetworkForClient);
router.post('/fixedgettransdataoftopup',         fixedtopupcontroller.get_top_payment_data);
router.post('/fixedallCurrency',                 Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.allCurrency);
router.post('/fixedpriceConversitionChanges',    Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.priceConversitionChanges);
// router.post('/fixedcheckbalance',                fixedtopupcontroller.checkbalance);
// router.post('/fixedverfiytranshash',             fixedtopupcontroller.verfiytranshash);
// router.post('/fixedcanceltopup',                 fixedtopupcontroller.cancelpaymentLink);


// router.post('/fixedsendotp',                     fixedtopupcontroller.sendotp);
// router.post('/fixedupdatetrans',                 fixedtopupcontroller.updatetrans);


module.exports = router;




