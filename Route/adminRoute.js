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
const commonController              = require('../controllers/Logs/commonController');
const paylinkController             = require('../controllers/PaymentLinks/paylinkController');
const Rolescontroller               = require('../controllers/Roles/Rolescontroller');
const clientHotWallets              = require('../controllers/Masters/clientHotWalletsController');
const topupcontroller               = require('../controllers/topup/topupcontroller');

router.post('/signupadmin',                                    Auth.is_admin,Auth.verify_signup_admin_api,adminController.signup_admin_api);
router.post('/adminlogin',                                     Auth.verify_admin_Login,adminController.Login);
router.post('/admingoogleauth',                                Auth.verify_Verfiy_Google_Auth,adminController.Verfiy_Google_Auth);
router.post('/customerstatus',                                 Auth.is_admin,Auth.Verfiy_Role,clientsController.customerstatus);
router.post('/getTransForAdmin',                               Auth.is_admin, Auth.Verfiy_Role,commonController.getTransForAdminNew);
router.post('/get_admin_withdraw',                             Auth.is_admin, Auth.Verfiy_Role,withdrawController.get_admin_wihdraw);
router.post('/allAdmin',                                       Auth.is_admin,Auth.Verfiy_Role,adminController.allAdmin);
router.post('/transcationListByNetworkID',                     Auth.is_admin,Auth.Verfiy_Role,transcationpoolController.get_Trans_by_Network_ID_For_Admin);
router.post('/forgetThePassword',                              adminController.forgetThePassword);
router.post('/VerfiyTheCode',                                  Auth.verify_Verfiy_Google_Auth,Auth.Verfiy_Role,adminController.VerfiyTheCode);
router.post('/updatePassword',                                 Auth.verify_admin_Login,Auth.Verfiy_Role,adminController.updateThePassword);
router.post('/resettwofa',                                     Auth.is_admin,Auth.Verfiy_Role,adminController.reset_two_fa);
router.post('/resetMerchantTwoFa',                             Auth.is_admin,Auth.Verfiy_Role,clientsController.reset_merchant_two_fa);
router.post('/changeMerchantEmail',                            Auth.is_admin,Auth.Verfiy_Role,clientsController.changeMerchantEmail);
router.post('/changeClientLoginStatus',                        Auth.is_admin,Auth.Verfiy_Role,Auth.verfiyAdminToken,clientsController.changeClientLoginStatus);
router.post('/changeAdminsLoginStatus',                        Auth.is_admin,Auth.Verfiy_Role,Auth.verfiyAdminToken,adminController.changeAdminsLoginStatus);
router.post('/createMerchantStoreByAdmin',                     Auth.is_admin,Auth.verfiyAdminToken,Auth.Verfiy_Role,merchantstoreController.createMerchantStoreByAdmin);
router.post('/getapikey',                                      Auth.verfiyAdminToken,Auth.Verfiy_Role,adminController.getapikey);
router.post('/approvekyc',                                     Auth.is_admin,Auth.Verfiy_Role,Auth.verfiyAdminToken, clientsController.kyc_approved);
"============================ Orphan Transcation ==============================="
router.post('/orphanPoolWallet',                              Auth.is_admin,Auth.Verfiy_Role,orphanController.orphanTranscation);
router.post('/orphanPoolWalletBalance',                       Auth.is_admin,Auth.Verfiy_Role,orphanController.checkBalanceorphanWallet);
router.post('/saveorphanWallet',                              Auth.is_admin,Auth.Verfiy_Role,orphanController.save_orphan_wallet);
"============================ Currency Master ==============================="
router.post('/createCurrency',                                Auth.is_admin,Auth.Verfiy_Role,CurrencyController.createCurrency);
router.get('/allCurrency',                                    Auth.is_admin,Auth.Verfiy_Role,CurrencyController.allCurrency);
router.post('/deleteCurrency',                                Auth.is_admin,Auth.Verfiy_Role,CurrencyController.deleteCurrency);
router.post('/updateCurrency',                                Auth.is_admin,Auth.Verfiy_Role,CurrencyController.updateCurrency);
"============================ Feed Wallet Controller ==============================="
router.post('/createFeedWallets',                               Auth.is_admin,Auth.Verfiy_Role,feedWalletController.createFeedWallets);
router.post('/addressFeeding',                                  Auth.is_admin,Auth.Verfiy_Role,feedWalletController.addressFeeding);
router.post('/allFeedWallets',                                  Auth.is_admin,Auth.Verfiy_Role,feedWalletController.allFeedWallets);
router.post('/deleteWallets',                                   Auth.is_admin,Auth.Verfiy_Role,feedWalletController.deleteWallets);
router.post('/checkbtcbalance',                                 Auth.is_admin,Auth.Verfiy_Role, feedWalletController.checkbtcbalance);
router.post('/transferbtcoin',                                  Auth.is_admin,Auth.Verfiy_Role,  feedWalletController.transferbtcoin);
router.post('/checktransstatus',                                Auth.is_admin, Auth.Verfiy_Role, feedWalletController.checktransstatus);
router.post('/createfw',                                        Auth.is_admin,Auth.Verfiy_Role,feedWalletController.createFeedingwalletby);
router.post('/checkbalance',                                    Auth.is_admin,Auth.Verfiy_Role,feedWalletController.checkbalance);
"============================ Category ==============================="
router.post('/approvecategoryRequest',                         Auth.is_admin,Auth.Verfiy_Role,merchantcategory.approveClientRequest);
router.post('/savecategory',                                   Auth.is_admin,Auth.Verfiy_Role,categoryController.savecategory);
router.get('/allcategory',                                     Auth.is_admin,Auth.Verfiy_Role,categoryController.allcategory);
router.post('/createClientCategory',                           Auth.is_admin,Auth.Verfiy_Role,merchantcategory.createClientCategory);
router.post('/getAllClientCategoryRequest',                    Auth.is_admin,Auth.Verfiy_Role,merchantcategory.getAllClientCategoryRequest);
"============================ Merchant ==============================="
router.post('/allMerchant',                                    Auth.is_admin,Auth.Verfiy_Role,clientsController.allMerchant);
"============================ Admin Hot wallets ==============================="

router.post('/get_All_Hot_Wallet_Transcations',                Auth.is_admin,Auth.Verfiy_Role,hotwallettranslogsController.get_All_Hot_Wallet_Transcation);
router.post('/Get_Feeding_Transfer_Status',                    Auth.is_admin,Auth.Verfiy_Role,hotwallettranslogsController.Get_Feeding_Transfer_Status);
router.post('/trans_from_pw_to_hw',                            Auth.is_admin,hotwallettranslogsController.trans_from_pw_to_hw);
router.post('/trans_from_fw_pw_to_hw',                         Auth.is_admin,Auth.Verfiy_Role,hotwallettranslogsController.trans_from_fw_pw_to_hw);
router.post('/trans_fm_FDW_To_PW',                             Auth.is_admin,Auth.Verfiy_Role,hotwallettranslogsController.trans_from_feeding_Wallet_to_pool_wallet);
router.post('/pool_wallet_balance',                            Auth.is_admin,Auth.Verfiy_Role,hotwallettranslogsController.Check_of_pool_wallet_address);
router.post('/confirm_the_pw_to_hw',                           Auth.is_admin,Auth.Verfiy_Role,hotwallettranslogsController.confirm_the_pw_to_hw);

"=============MerchantStore==========================================="

router.post('/changemerchantstore',                             Auth.is_admin,Auth.Verfiy_Role,merchantstoreController.adminchangeMerchantStore);
router.get('/allMerchantStore',                                 Auth.is_admin,Auth.Verfiy_Role,merchantstoreController.allMerchantStore);



"=============All Deposit Transcation==========================================="
router.get('/alldeposittranscation',        Auth.is_admin,Auth.Verfiy_Role,commonController.getAllTranscation);
router.post('/clientimpersonate',           Auth.is_admin,Auth.Verfiy_Role,adminController.clientimpersonate);
router.post('/getClientWalletsForAdmin',    Auth.is_admin,Auth.Verfiy_Role,clientsController.getClientWalletsForAdmin);
router.post('/getKycLevel',                 Auth.is_admin,Auth.Verfiy_Role,adminController.get_kyc_level);
router.post('/get_all_invoice_for_admin',  Auth.is_admin,Auth.Verfiy_Role,paylinkController.get_All_Invoice_For_Admin);
router.post('/updateInvoiceByAdmin',            Auth.is_admin,Auth.Verfiy_Role,paylinkController.updateInvoiceByAdmin);
router.post('/get_all_deposit_client_by_admin', Auth.is_admin,Auth.Verfiy_Role,clientsController.get_For_Admin);



"============= All Role Based ==================="
router.post('/get_all_API',                       Auth.is_admin,Auth.Verfiy_Role,Rolescontroller.get_all_all_API);
router.post('/create_or_update_roles',            Auth.is_admin,Auth.Verfiy_Role,Rolescontroller.create_or_update_roles);
router.post('/create_roles_permission',           Auth.is_admin,Auth.Verfiy_Role,Rolescontroller.create_or_update_roles_permission);
router.post('/get_all_roles',                     Auth.is_admin,Auth.Verfiy_Role,Rolescontroller.get_all_roles);
router.post('/update_role_Permisson',             Auth.is_admin,Auth.Verfiy_Role,Rolescontroller.update_role_Permisson);
router.post('/get_all_roles_with_permission',     Auth.is_admin,Auth.Verfiy_Role,Rolescontroller.get_all_roles_with_permission);

"============= All Client Wallet API ==================="
router.post('/create_or_update_clienthotwallets',   Auth.is_admin,Auth.Verfiy_Role,clientHotWallets.create_or_update_clienthotwallets);
router.post('/get_all_clienthotwallets',            Auth.is_admin,Auth.Verfiy_Role,clientHotWallets.get_all_clienthotwallets);
router.post('/updateadminrole',                     Auth.is_admin,Auth.Verfiy_Role,adminController.updateadminrole);

"============= All Pool Wallet ==================="
router.post('/getAllPoolWallet',                    Auth.is_admin,Auth.Verfiy_Role,commonController.getAllPoolWallet);
router.post('/getTranscationofPoolwallet',          Auth.is_admin,Auth.Verfiy_Role,commonController.getTranscationofPoolwallet);

router.post('/update_the_transcation_by_admin', Auth.is_admin,Auth.Verfiy_Role,adminController.update_The_Transcation_BY_Admin);
router.post('/update_withdraw_limit',           Auth.is_admin,Auth.Verfiy_Role,clientsController.update_withdraw_limit);
router.post('/change_the_topuptimespent',       Auth.is_admin,Auth.Verfiy_Role,topupcontroller.change_the_topuptimespent);
router.post('/Get_User_Roles',                  Auth.is_admin, adminController.Get_User_Roles);
router.post('/get_Payment_History',             Auth.is_admin,Auth.Verfiy_Role,commonController.getPaymentHistory);
router.post('/call_the_webhook',                Auth.is_admin,Auth.Verfiy_Role,topupcontroller.call_the_webhook);
router.post('/get_the_webhook',                 Auth.is_admin,Auth.Verfiy_Role,topupcontroller.get_the_webhook);
router.post('/change_topup_network',            Auth.is_admin,Auth.Verfiy_Role,topupcontroller.change_topup_network);

router.post('/getdupilcate',                 commonController.getdupilcate);

// router.post('/getAllPoolWallet',Auth.is_admin,Auth.Verfiy_Role,commonController.getAllPoolWallet);
module.exports = router;
