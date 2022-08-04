var express             = require('express');
var router              = express.Router();
const networkController   = require('../controllers/networkController');
router.post('/createNetwork',   networkController.create_Network);
router.get('/allNetwork',       networkController.all_network);
router.post('/updateNetwork',   networkController.update_Network);
module.exports = router;
