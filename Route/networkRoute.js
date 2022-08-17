var express             = require('express');
var router              = express.Router();
const networkController   = require('../controllers/networkController');
router.post('/createNetwork',                networkController.create_Network);
router.get('/allNetwork',                    networkController.all_network);
router.post('/updateNetwork',                networkController.update_Network);
router.post('/deleteNetwork',                networkController.delete_network);
router.post('/changeStatusNetwork',          networkController.change_status_network);
router.post('/changeHotWalletStatusLimit',   networkController.changeHotWalletStatusLimit);

module.exports = router;
