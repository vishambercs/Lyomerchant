// var express = require('express');
// var router = express.Router();
// const payLinkController = require('../controllers/PaymentLinks/paylinkController');
// const Auth = require('../Validation/Auth');

// router.post('/storeInvoice', Auth.paylink_have_access, payLinkController.storeInvoice);
// router.post('/paymentLink', Auth.paylink_have_access, payLinkController.getPaymentLink);
// router.post('/getAllInvoices', Auth.paylink_have_access, payLinkController.getAllInvoices);
// router.post('/verifyPaymentLink', Auth.paylink_have_access, payLinkController.verifyPaymentLink);
// router.post('/createFastCode', Auth.paylink_have_access, payLinkController.createFastCode);
// router.post('/verifyFastPayment', Auth.paylink_have_access, payLinkController.verifyFastPayment);
// router.post('/verifyFastCode', Auth.paylink_have_access, payLinkController.verifyFastCode);
// router.post('/deleteFastCode', Auth.paylink_have_access, payLinkController.deleteFastCode);
// router.post('/assignPaymentLinkMerchantWallet', Auth.paylink_have_access, payLinkController.assignPaymentLinkMerchantWallet)

// module.exports = router;

var express = require('express');
var router = express.Router();
const payLinkController = require('../controllers/PaymentLinks/paylinkController');
const Auth = require('../Validation/Auth');

router.post('/storeInvoice',        payLinkController.storeInvoice);
router.post('/paymentLink',         payLinkController.getPaymentLink);
router.post('/getAllInvoices',      payLinkController.getAllInvoices);
router.post('/verifyPaymentLink',   payLinkController.verifyPaymentLink);
router.post('/createFastCode',      payLinkController.createFastCode);
router.post('/verifyFastPayment',   payLinkController.verifyFastPayment);
router.post('/verifyFastCode',      payLinkController.verifyFastCode);
router.post('/deleteFastCode',                   payLinkController.deleteFastCode);
router.post('/assignPaymentLinkMerchantWallet',  payLinkController.assignPaymentLinkMerchantWallet)


module.exports = router;