var express             = require('express');
var router              = express.Router();
const hotwalletController   = require('../controllers/hotwalletController');
router.post('/createHotWallets',        hotwalletController.createHotWallets);
router.post('/createHotWalletsAPI',     hotwalletController.createHotWalletsAPI);
router.get('/allHotWallets',            hotwalletController.allHotWallets);
router.post('/hotwalletTranscation',    hotwalletController.hotwalletTranscation);
router.post('/deletehotwallet',         hotwalletController.deleteHotWallets);
router.post('/updateHotWallet',         hotwalletController.updateHotWallets);

module.exports = router;
