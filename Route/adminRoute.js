var express                         = require('express');
var router                          = express.Router();
const adminController               = require('../controllers/adminController');
const transcationpoolController     = require('../controllers/transcationpoolController');
const withdrawController            = require('../controllers/withdrawController');
const networkController             = require('../controllers/networkController');
const categoryController            = require('../controllers/categoryController');
const merchantcategory              = require('../controllers/merchantcategoryController');
const clientsController             = require('../controllers/clientsController');
const orphanController              = require('../controllers/orphanTranscationController');
const CurrencyController            = require('../controllers/Masters/CurrencyController');
const Auth                          = require('../Validation/Auth');

router.post('/signupadmin',                                   adminController.signup_admin_api);
router.post('/adminlogin',                                    adminController.Login);
router.post('/admingoogleauth',                               adminController.Verfiy_Google_Auth);
router.post('/getTransForAdmin',                              Auth.is_admin,transcationpoolController.getTransForAdmin);
router.post('/get_admin_withdraw',                            Auth.is_admin,withdrawController.get_admin_wihdraw);
router.post('/allAdmin',                                      Auth.is_admin,adminController.allAdmin);
router.post('/sendemail',                                     Auth.is_admin,adminController.sendEmail);
router.post('/transcationListByNetworkID',                    Auth.is_admin,transcationpoolController.get_Trans_by_Network_ID_For_Admin);
router.post('/savecategory',                                  Auth.is_admin,categoryController.savecategory);
router.get('/allcategory',                                    Auth.is_admin, categoryController.allcategory);
router.post('/createClientCategory',                          Auth.is_admin,merchantcategory.createClientCategory);
router.post('/forgetThePassword',                             Auth.is_admin, adminController.forgetThePassword);
router.post('/VerfiyTheCode',                                 Auth.is_admin,adminController.VerfiyTheCode);
router.post('/updatePassword',                                Auth.is_admin, adminController.updateThePassword);
router.post('/resettwofa',                                    Auth.is_admin,adminController.reset_two_fa);
router.post('/resetMerchantTwoFa',                            Auth.is_admin,clientsController.reset_merchant_two_fa);
router.post('/changeMerchantEmail',                           Auth.is_admin,clientsController.changeMerchantEmail);
// router.post('/changeMerchantPassword',                     clientsController.changeMerchantPassword);
router.post('/merchantImpersonation',                         Auth.is_admin,clientsController.merchantImpersonation);
"============================ Orphan Transcation ==============================="
router.post('/orphanPoolWallet',                              Auth.is_admin,orphanController.orphanTranscation);
"============================ Currency Master ==============================="
router.post('/createCurrency',                                Auth.is_admin,CurrencyController.createCurrency);
router.get('/allCurrency',                                    Auth.is_admin,CurrencyController.allCurrency);
router.post('/deleteCurrency',                                Auth.is_admin,CurrencyController.deleteCurrency);
router.post('/updateCurrency',                                Auth.is_admin,CurrencyController.updateCurrency);

module.exports = router;
