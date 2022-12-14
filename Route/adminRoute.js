// var express                         = require('express');
// var router                          = express.Router();
// const adminController               = require('../controllers/adminController');
// const transcationpoolController     = require('../controllers/transcationpoolController');
// const withdrawController            = require('../controllers/withdrawController');
// const networkController             = require('../controllers/networkController');
// const categoryController            = require('../controllers/Masters/categoryController');
// const merchantcategory              = require('../controllers/Masters/merchantcategoryController');
// const clientsController             = require('../controllers/clientsController');
// const orphanController              = require('../controllers/orphanTranscationController');
// const CurrencyController            = require('../controllers/Masters/CurrencyController');
// const Auth                          = require('../Validation/Auth');

// router.post('/signupadmin',                                   adminController.signup_admin_api);
// router.post('/adminlogin',                                    adminController.Login);
// router.post('/admingoogleauth',                               adminController.Verfiy_Google_Auth);
// router.post('/getTransForAdmin',                              Auth.is_admin,transcationpoolController.getTransForAdmin);
// router.post('/get_admin_withdraw',                            Auth.is_admin,withdrawController.get_admin_wihdraw);
// router.post('/allAdmin',                                      Auth.is_admin,adminController.allAdmin);
// router.post('/sendemail',                                     Auth.is_admin,adminController.sendEmail);
// router.post('/transcationListByNetworkID',                    Auth.is_admin,transcationpoolController.get_Trans_by_Network_ID_For_Admin);
// router.post('/savecategory',                                  Auth.is_admin,categoryController.savecategory);
// router.get('/allcategory',                                    Auth.is_admin, categoryController.allcategory);
// router.post('/createClientCategory',                          Auth.is_admin,merchantcategory.createClientCategory);
// router.post('/forgetThePassword',                             Auth.is_admin, adminController.forgetThePassword);
// router.post('/VerfiyTheCode',                                 Auth.is_admin,adminController.VerfiyTheCode);
// router.post('/updatePassword',                                Auth.is_admin, adminController.updateThePassword);
// router.post('/resettwofa',                                    Auth.is_admin,adminController.reset_two_fa);
// router.post('/resetMerchantTwoFa',                            Auth.is_admin,clientsController.reset_merchant_two_fa);
// router.post('/changeMerchantEmail',                           Auth.is_admin,clientsController.changeMerchantEmail);
// // router.post('/changeMerchantPassword',                     clientsController.changeMerchantPassword);
// router.post('/merchantImpersonation',                         Auth.is_admin,clientsController.merchantImpersonation);
// "============================ Orphan Transcation ==============================="
// router.post('/orphanPoolWallet',                              Auth.is_admin,orphanController.orphanTranscation);
// "============================ Currency Master ==============================="
// router.post('/createCurrency',                                Auth.is_admin,CurrencyController.createCurrency);
// router.get('/allCurrency',                                    Auth.is_admin,CurrencyController.allCurrency);
// router.post('/deleteCurrency',                                Auth.is_admin,CurrencyController.deleteCurrency);
// router.post('/updateCurrency',                                Auth.is_admin,CurrencyController.updateCurrency);

// module.exports = router;
var express                         = require('express');
var router                          = express.Router();
const adminController               = require('../controllers/adminController');
const transcationpoolController     = require('../controllers/transcationpoolController');
const withdrawController            = require('../controllers/withdrawController');
const networkController             = require('../controllers/networkController');
const categoryController            = require('../controllers/Masters/categoryController');
const merchantcategory              = require('../controllers/Masters/merchantcategoryController');
const clientsController             = require('../controllers/clientsController');
const orphanController              = require('../controllers/orphanTranscationController');
const CurrencyController            = require('../controllers/Masters/CurrencyController');
const feedWalletController          = require('../controllers/Masters/feedWalletController');
const Auth                          = require('../Validation/Auth');
const poolwalletController          = require('../controllers/poolwalletController');
const hotwallettranslogsController  = require('../controllers/hotwallettranslogsController');
const merchantstoreController       = require('../controllers/POS/merchantstoreController');
const commonController = require('../controllers/Logs/commonController');

// router.post('/sendemail',                                      Auth.is_admin,adminController.sendEmail);
// router.post('/merchantImpersonation',                          Auth.is_admin,clientsController.merchantImpersonation);

router.post('/signupadmin',                                    Auth.is_admin,Auth.verify_signup_admin_api,adminController.signup_admin_api);
router.post('/adminlogin',                                     Auth.verify_admin_Login,adminController.Login);
router.post('/admingoogleauth',                                Auth.verify_Verfiy_Google_Auth,adminController.Verfiy_Google_Auth);
router.post('/customerstatus',                                 Auth.is_admin,clientsController.customerstatus);
router.post('/getTransForAdmin',                               Auth.is_admin,transcationpoolController.getTransForAdmin);
router.post('/get_admin_withdraw',                             Auth.is_admin, withdrawController.get_admin_wihdraw);
router.post('/allAdmin',                                       Auth.is_admin,adminController.allAdmin);
router.post('/transcationListByNetworkID',                     Auth.is_admin,transcationpoolController.get_Trans_by_Network_ID_For_Admin);
router.post('/forgetThePassword',                              adminController.forgetThePassword);
router.post('/VerfiyTheCode',                                  Auth.verify_Verfiy_Google_Auth,adminController.VerfiyTheCode);
router.post('/updatePassword',                                 Auth.verify_admin_Login,adminController.updateThePassword);
router.post('/resettwofa',                                     Auth.is_admin,adminController.reset_two_fa);
router.post('/resetMerchantTwoFa',                             Auth.is_admin,clientsController.reset_merchant_two_fa);
router.post('/changeMerchantEmail',                            Auth.is_admin,clientsController.changeMerchantEmail);
router.post('/changeClientLoginStatus',                        Auth.is_admin,Auth.verfiyAdminToken,clientsController.changeClientLoginStatus);
router.post('/changeAdminsLoginStatus',                        Auth.is_admin,Auth.verfiyAdminToken,adminController.changeAdminsLoginStatus);
router.post('/createMerchantStoreByAdmin',                     Auth.is_admin,Auth.verfiyAdminToken,merchantstoreController.createMerchantStoreByAdmin);
router.post('/getapikey',                                      Auth.verfiyAdminToken,adminController.getapikey);
router.post('/approvekyc',                                     Auth.is_admin,Auth.verfiyAdminToken, clientsController.kyc_approved);


"============================ Orphan Transcation ==============================="

router.post('/orphanPoolWallet',                              Auth.is_admin,orphanController.orphanTranscation);
router.post('/orphanPoolWalletBalance',                       Auth.is_admin,orphanController.checkBalanceorphanWallet);
router.post('/saveorphanWallet',                              Auth.is_admin,orphanController.save_orphan_wallet);

"============================ Currency Master ==============================="

router.post('/createCurrency',                                Auth.is_admin,CurrencyController.createCurrency);
router.get('/allCurrency',                                    Auth.is_admin,CurrencyController.allCurrency);
router.post('/deleteCurrency',                                Auth.is_admin,CurrencyController.deleteCurrency);
router.post('/updateCurrency',                                Auth.is_admin,CurrencyController.updateCurrency);

"============================ Feed Wallet Controller ==============================="

router.post('/createFeedWallets',                               Auth.is_admin,feedWalletController.createFeedWallets);
router.post('/addressFeeding',                                  Auth.is_admin,feedWalletController.addressFeeding);
router.post('/allFeedWallets',                                  Auth.is_admin,feedWalletController.allFeedWallets);
router.post('/deleteWallets',                                   Auth.is_admin,feedWalletController.deleteWallets);
router.post('/checkbtcbalance',                                 Auth.is_admin, feedWalletController.checkbtcbalance);
router.post('/transferbtcoin',                                  Auth.is_admin,  feedWalletController.transferbtcoin);
router.post('/checktransstatus',                                Auth.is_admin,  feedWalletController.checktransstatus);
router.post('/createfw',                                        Auth.is_admin,feedWalletController.createFeedingwalletby);
router.post('/checkbalance',                                    Auth.is_admin,feedWalletController.checkbalance);
// router.post('/transferbtcoin',                                feedWalletController.transferbtcoin);

"============================ Category ==============================="

router.post('/approvecategoryRequest',                         Auth.is_admin,merchantcategory.approveClientRequest);
router.post('/savecategory',                                   Auth.is_admin,categoryController.savecategory);
router.get('/allcategory',                                     Auth.is_admin,categoryController.allcategory);
router.post('/createClientCategory',                           Auth.is_admin,merchantcategory.createClientCategory);
router.post('/getAllClientCategoryRequest',                    Auth.is_admin,merchantcategory.getAllClientCategoryRequest);

"============================ Merchant ==============================="

router.post('/allMerchant',                                    Auth.is_admin,clientsController.allMerchant);
 
"============================ Admin Hot wallets ==============================="

router.post('/get_All_Hot_Wallet_Transcations',                Auth.is_admin,hotwallettranslogsController.get_All_Hot_Wallet_Transcation);
router.post('/Get_Feeding_Transfer_Status',                    Auth.is_admin,hotwallettranslogsController.Get_Feeding_Transfer_Status);
router.post('/trans_from_pw_to_hw',                            Auth.is_admin,hotwallettranslogsController.trans_from_pw_to_hw);
router.post('/trans_from_fw_pw_to_hw',                         Auth.is_admin,hotwallettranslogsController.trans_from_fw_pw_to_hw);
router.post('/trans_fm_FDW_To_PW',                             Auth.is_admin,hotwallettranslogsController.trans_from_feeding_Wallet_to_pool_wallet);
router.post('/pool_wallet_balance',                            Auth.is_admin,hotwallettranslogsController.Check_of_pool_wallet_address);
router.post('/confirm_the_pw_to_hw',                           Auth.is_admin,hotwallettranslogsController.confirm_the_pw_to_hw);

"=============MerchantStore==========================================="

router.post('/changemerchantstore',                             Auth.is_admin,merchantstoreController.adminchangeMerchantStore);
router.get('/allMerchantStore',                                 Auth.is_admin,merchantstoreController.allMerchantStore);



"=============All Deposit Transcation==========================================="

router.get('/alldeposittranscation',  Auth.is_admin,commonController.getAllTranscation);



module.exports = router;
