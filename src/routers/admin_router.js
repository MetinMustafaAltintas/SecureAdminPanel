const router = require('express').Router();
const adminController = require('../controllers/admin_controller');
const authMiddleware = require('../middlewares/auth_middleware');

router.get('/',authMiddleware.oturumAcilmis, adminController.anaSayfayiGoster);



module.exports = router;