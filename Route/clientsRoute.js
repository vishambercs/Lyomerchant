var express                         = require('express');
var router                          = express.Router();
const topupcontroller               = require('../controllers/topup/topupcontroller');
router.post('/pluginallNetworks',                  topupcontroller.pluginallNetworks);
router.post('/assigntopupMerchantWallet',          topupcontroller.assigntopupMerchantWallet);
router.post('/getTranscationDataofTopup',          topupcontroller.getTranscationDataofTopup);
router.post('/getTransStatus',                     topupcontroller.getTransStatus);
router.post('/canceltopup',                        topupcontroller.canceltopup);
router.post('/checkbalance',                       topupcontroller.checkbalance);
router.post('/verfiytranshash',                    topupcontroller.verfiytranshash);
router.post('/sendotp',                            topupcontroller.sendotp);
router.post('/updatetrans',                        topupcontroller.updatetrans);
router.post('/updatetrans_with_network',           topupcontroller.updatetrans_with_network);

// router.post('/verfiythebalance',                   topupcontroller.verfiythebalance);
// router.post('/updatethetrans',                     topupcontroller.updatethetrans);


module.exports = router;




