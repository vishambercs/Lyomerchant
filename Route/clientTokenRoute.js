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


router.get('/allCurrency',                  Auth.Verfiy_Auth_Token, Auth.verify_verifythedata,CurrencyController.allCurrency);
router.post('/assigntopupMerchantWallet',   Auth.Verfiy_Auth_Token,topupcontroller.create_top_payment);
router.post('/pluginallNetworks',           Auth.Verfiy_Auth_Token,Auth.checkaccess,networkController.allPreferedeNetworkForClient);
router.post('/getTranscationDataofTopup',   Auth.Verfiy_Auth_Token,topupcontroller.get_top_payment_data);
router.post('/canceltopup',                 Auth.Verfiy_Auth_Token,topupcontroller.cancelpaymentLink);
router.post('/checkbalance',                Auth.Verfiy_Auth_Token,topupcontroller.checkbalance);
router.post('/verfiytranshash',             Auth.Verfiy_Auth_Token, topupcontroller.verfiytranshash);
router.post('/sendotp',                     Auth.Verfiy_Auth_Token,topupcontroller.sendotp);
router.post('/getTransStatus',              Auth.Verfiy_Auth_Token,commonController.getTransStatus);
router.post('/updatetrans',                 Auth.Verfiy_Auth_Token,topupcontroller.updatetrans);
router.post('/updatetransbyid',             Auth.Verfiy_WebHook,topupcontroller.updatetransbyid);

"============================Create Fixed Top UP==============================="
router.post('/fixedassigntopupMerchantWallet',   Auth.Verfiy_Auth_Token,fixedtopupcontroller.create_top_payment);
router.post('/fixedpluginallNetworks',           Auth.Verfiy_Auth_Token,Auth.checkaccess,networkController.allPreferedeNetworkForClient);
router.post('/fixedgettransdataoftopup',         Auth.Verfiy_Auth_Token,fixedtopupcontroller.get_top_payment_data);
router.post('/fixedallCurrency',                 Auth.Verfiy_Auth_Token,Auth.checkaccess,CurrencyController.allCurrency);
router.post('/fixedpriceConversitionChanges',    Auth.Verfiy_Auth_Token,Auth.checkaccess,CurrencyController.priceConversitionChanges);
router.post('/fixedallCurrency',                 Auth.Verfiy_Auth_Token,Auth.checkaccess,CurrencyController.allCurrency);


"============================API Token==============================="
router.post('/getapitoken',   apitokenController.save_api_token);







module.exports = router;




