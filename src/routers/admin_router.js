const router = require('express').Router();
const adminController = require('../controllers/admin_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const multerConfig = require('../config/multer_config');

router.get('/',authMiddleware.oturumAcilmis, adminController.anaSayfayiGoster);
router.get('/profil',authMiddleware.oturumAcilmis, adminController.profilSayfasiniGoster);
router.post('/profil-guncelle',authMiddleware.oturumAcilmis,multerConfig.single('avatar'), adminController.profilGuncelle);



module.exports = router;