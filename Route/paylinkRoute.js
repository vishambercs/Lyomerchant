

var express             = require('express');
var router              = express.Router();
const payLinkController = require('../controllers/PaymentLinks/paylinkController');
const Auth              = require('../Validation/Auth');

router.post('/storeInvoice',                        Auth.paylink_have_access,payLinkController.storeInvoice);
router.post('/paymentLink',                         Auth.paylink_have_access,payLinkController.getPaymentLink);
router.post('/getAllInvoices',                      Auth.paylink_have_access,payLinkController.getAllInvoices);
router.post('/verifyPaymentLink',                   Auth.public_paylink_access,payLinkController.verifyPaymentLink);
router.post('/createFastCode',                      Auth.fastpay_have_access,payLinkController.createFastCode);
router.post('/verifyFastPayment',                   Auth.fastpay_have_access, payLinkController.verifyFastPayment);
router.post('/verifyFastCode',                      Auth.public_fastpay_access,payLinkController.verifyFastCode);
router.post('/deleteFastCode',                      Auth.paylink_have_access,payLinkController.deleteFastCode);
router.post('/deleteInvoice',                       Auth.paylink_have_access,payLinkController.deleteInvoice);
router.post('/assignPaymentLinkMerchantWallet',     Auth.public_paylink_access,payLinkController.assignPaymentLinkMerchantWallet)
router.post('/assignFastCodeMerchantWallet',        Auth.fastpay_have_access,payLinkController.assignPaymentLinkMerchantWallet)
router.post('/cancelpaymentLink',                   payLinkController.cancelpaymentLink);
module.exports = router;