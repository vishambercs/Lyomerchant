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
router.post('/getBalanceAddress',                    Auth.is_merchant,clientsController.get_BalancebyAddress);
router.post('/approvekyc',                           clientsController.kyc_approved);
router.post('/getmerchantWallets',                   Auth.is_merchant,clientsController.getClientWallets);
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
router.post('/customerstatus',                       clientsController.customerstatus);
router.post('/resetMerchantTwoFa',                   clientsController.reset_merchant_two_fa);
router.post('/clientwithdrawnetworkid',              withdrawController.get_client_withdraw_with_network_id);
router.post('/updateClientToken',                    clientsController.updateClientToken);
router.post('/getapikey',                            Auth.verfiyClientToken,clientsController.getapikey);
router.post('/getTranscationData',                   Auth.is_merchant,hotwallettranslogsController.getTranscationData);
router.post('/transactionDetailsClient',             Auth.is_merchant,transcationpoolController.get_Trans_by_txId);
router.post('/transactionFastDetails',               Auth.fastpay_have_access,transcationpoolController.get_Fastlink_Trans_by_txId);
router.post('/transactionPaylinkDetails',            Auth.paylink_have_access,transcationpoolController.get_Fastlink_Trans_by_txId);
router.post('/generateNewClientAddress',             Auth.is_merchant,clientsController.generateNewClientAddress);
router.post('/forgotPassword',                       clientsController.forgotPassword);
router.post('/tokenAndUpdatePassword',               clientsController.checkTheTokenAndUpdatePassword);
router.post('/resetPassword',                        clientsController.ResetPassword);
router.post('/updateMerchantProfileImage',           Auth.is_merchant,clientsController.updateMerchantProfileImage);

"=============Merchant-Sites==========================================="

router.post('/allMerchantSites',                         merchantSitesController.allMerchantSites);
router.post('/deleteMerchantSite',                       merchantSitesController.deleteMerchantSite);
router.post('/savemerchantsite',                         merchantSitesController.savemerchantsite);
router.post('/updateMerchantSite',                       merchantSitesController.updateMerchantSite);

"=============MerchantStore==========================================="

router.post('/createMerchantStore',                         Auth.is_merchant,Auth.has_Pos_Access,merchantstoreController.createMerchantStore);
router.post('/merchantstore',                               Auth.is_merchant,Auth.has_Pos_Access,merchantstoreController.MerchantStore);
router.post('/merchantStoreProfileUpdate',                  Auth.is_merchant,Auth.has_Pos_Access,merchantstoreController.updateMerchantStoreProfile);
router.post('/changemerchantstore',                         Auth.is_merchant,Auth.has_Pos_Access,merchantstoreController.changeMerchantStore);
router.post('/regsiterStoreDevices',                        Auth.store_have_access,merchantStoreDeviceController.regsiterStoreDevices);
router.post('/verifydeviceOTP',                             Auth.store_have_access,merchantStoreDeviceController.verifyDeviceOTP);
router.post('/getAllStoreDevices',                          Auth.store_have_access,merchantStoreDeviceController.getAllStoreDevice);
router.post('/getAllStoreDeviceForMerchantAdmin',           Auth.store_have_access,merchantStoreDeviceController.getAllStoreDeviceForAdmin);
router.post('/disableordeletedevices',                      Auth.store_have_access,merchantStoreDeviceController.disableordelete);
router.post('/posGetTransByStorekey',                       Auth.store_have_access,posTransactionPoolController.getTranscationDetailsByStoreID);
router.post('/getallclientstoredevices',                    Auth.is_merchant,merchantStoreDeviceController.getAllClientStoreDevices);


"=============Pos Merchant Wallet==========================================="

router.post('/assignPosMerchantWallet',                     Auth.check_Store_Device_Access,posTransactionPoolController.assignPosMerchantWallet);
router.post('/shopTransList',                               Auth.check_Store_Device_Access,posTransactionPoolController.getShopTransList);
router.get('/posallCurrency',                               Auth.check_Store_Device_Access,CurrencyController.allCurrency);
router.post('/pospriceConversition',                        Auth.check_Store_Device_Access,CurrencyController.priceConversition);
router.post('/posallNetworks',                              Auth.check_Store_Device_Access,networkController.allNetworkForClient);
router.post('/posGetTransByDeviceID',                       Auth.check_Store_Device_Access,posTransactionPoolController.getTranscationDetailsByDeviceID);





"============================ Currency Master ==============================="

router.get('/allCurrency',                                      CurrencyController.allCurrency);
router.post('/priceConversition',                               CurrencyController.priceConversition);

"============================ NETWORK Master ==============================="

router.post('/allNetworks',                                     Auth.is_merchant,networkController.allNetworkForClient);

"============================ Category Master ==============================="

router.post('/createClientCategory',                            Auth.is_merchant,merchantcategory.createClientCategory);
router.get('/allcategory',                                      Auth.is_merchant,categoryController.allcategory);
router.get('/getClientCategory',                                Auth.is_merchant,merchantcategory.getClientCategory);
router.post('/cancelClientRequest',                             Auth.is_merchant,merchantcategory.cancelClientRequest);

"============================ WEB PLUGIN ==============================="

router.post('/assignMerchantWallet',                            Auth.Verfiy_Merchant,Auth.plugin_have_access,transcationpoolController.assignMerchantWallet);
router.post('/pluginallNetworks',                               Auth.Verfiy_Merchant,Auth.checkaccess,networkController.allNetworkForClient);
router.post('/pluginallCurrency',                               Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.allCurrency);
router.post('/pluginpriceConversition',                         Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.priceConversition);

"============================ Withdraw  ==============================="

router.post('/setWithdrawSettings',                                 withdrawController.setWithdrawSettings);
router.get('/getWithdrawSettings',                                  withdrawController.getWithdrawSettings);
router.post('/merchantBalance',                                     withdrawController.merchantBalance);
router.post('/merchantWithdrawBalance',                             withdrawController.withdrawBalance);


"============================ perfered Network Controller  ==============================="

router.post('/createPerferedNetwork',                               Auth.is_merchant,perferedNetworkController.create_perfered_Network);
router.post('/getPerferedNetwork',                                  Auth.is_merchant,perferedNetworkController.get_perfered_Network);

"============================ HOSTRED PAYMENT  ==============================="

router.post('/createHostePayment',                                  Auth.paylink_have_access,Auth.verify_variables,PaymentHostedController.createHostePayment);
router.post('/ipntesting',                                          PaymentHostedController.IPN_Testing);

"============================ clientapikey  ==============================="

router.post('/getapistatus',                                        clientapicontroller.getapikey);


"============================ Common Controller  ==============================="

router.post('/getTransStatus',                                        Auth.checkaccess,commonController.getTransStatus);

router.get('/getalltranscationofmerchant',                           Auth.is_merchant,commonController.getAllTranscationOfMerchant);

router.post('/balancecheck',                                          commonController.getBalance);

"============================IPN Controller==============================="
router.post('/createIPNLink',ipnController.create_IPN_Link);
router.post('/getIPNLink',ipnController.get_IPN_Link);




module.exports = router;




