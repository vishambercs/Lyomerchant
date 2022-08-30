var express             = require('express');
var router              = express.Router();
const payLinkController = require('../controllers/PaymentLinks/paylinkController');
const Auth              = require('../Validation/Auth');

router.post('/storeInvoice',        Auth.paylink_have_access,payLinkController.storeInvoice);
router.post('/paymentLink',         Auth.paylink_have_access,payLinkController.getPaymentLink);
router.post('/getAllInvoices',      Auth.paylink_have_access,payLinkController.getAllInvoices);
router.post('/verifyPaymentLink',   Auth.paylink_have_access,payLinkController.verifyPaymentLink);
router.post('/createFastCode',      Auth.paylink_have_access,payLinkController.createFastCode);
router.post('/verifyFastPayment',   Auth.paylink_have_access,payLinkController.verifyFastPayment);
router.post('/verifyFastCode',      Auth.paylink_have_access,payLinkController.verifyFastCode);
router.post('/deleteFastCode',      Auth.paylink_have_access,payLinkController.deleteFastCode);

module.exports = router;