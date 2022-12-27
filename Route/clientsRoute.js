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
const apitokenController            = require('../controllers/Masters/apitokenController');


router.get('/allCurrency',                               CurrencyController.allCurrency);
router.post('/assigntopupMerchantWallet',                Auth.verify_verifythedata,topupcontroller.create_top_payment);
router.post('/pluginallNetworks',                        Auth.Verfiy_Merchant,Auth.checkaccess,networkController.allPreferedeNetworkForClient);
router.post('/getTranscationDataofTopup',                topupcontroller.get_top_payment_data);
router.post('/canceltopup',                              topupcontroller.cancelpaymentLink);
router.post('/checkbalance',                             topupcontroller.checkbalance);
router.post('/verfiytranshash',                          topupcontroller.verfiytranshash);
router.post('/sendotp',                                  topupcontroller.sendotp);
router.post('/getTransStatus',                           commonController.getTransStatus);
router.post('/updatetrans',                              topupcontroller.updatetrans);
router.post('/updatetrans_with_network',                 topupcontroller.updatetrans_with_network);
router.post('/updatetransbyid',                          Auth.Verfiy_WebHook,topupcontroller.updatetransbyid);
router.post('/update_The_Transcation_by_cs',             topupcontroller.update_The_Transcation_by_cs);
router.post('/checkbalanceforwewe',                      topupcontroller.checkbalanceforwewe);
router.post('/call_the_webhook',                         topupcontroller.call_the_webhook);
router.post('/get_the_webhook',                          topupcontroller.get_the_webhook);

"============================Create Fixed Top UP==============================="
router.post('/fixedassigntopupMerchantWallet',   fixedtopupcontroller.create_top_payment);
router.post('/fixedpluginallNetworks',           Auth.Verfiy_Merchant,Auth.checkaccess,networkController.allPreferedeNetworkForClient);
router.post('/fixedgettransdataoftopup',         fixedtopupcontroller.get_top_payment_data);
router.post('/fixedallCurrency',                 Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.allCurrency);
router.post('/fixedpriceConversitionChanges',    Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.priceConversitionChanges);
router.post('/fixedallCurrency',                 Auth.Verfiy_Merchant,Auth.checkaccess,CurrencyController.allCurrency);


// "============================API Token==============================="
// router.post('/getapitoken',                 apitokenController.save_api_token);







module.exports = router;




