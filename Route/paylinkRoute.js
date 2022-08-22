var express = require('express');
var router = express.Router();
const payLinkController = require('../controllers/paylinkController');


router.post('/storeInvoice',payLinkController.storeInvoice);
router.post('/paymentLink',payLinkController.getPaymentLink);
router.post('/getAllInvoices',payLinkController.getAllInvoices);
router.post('/verifyPaymentLink',payLinkController.verifyPaymentLink);
router.post('/createFastCode',payLinkController.createFastCode);
router.post('/verifyFastPayment',payLinkController.verifyFastPayment);


module.exports = router;