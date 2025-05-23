const router = require('express').Router();
const authController = require('../controllers/auth_controller');
const validatorMiddleware = require('../middlewares/validation_middleware');
const authMiddleware = require('../middlewares/auth_middleware');

router.get('/login',authMiddleware.oturumAcilmamis, authController.loginFormunuGoster);
router.post('/login',authMiddleware.oturumAcilmamis, validatorMiddleware.validateLogin(), authController.login);

router.get('/verify', authController.veriftMail);

router.get('/logout',authMiddleware.oturumAcilmis, authController.logout);


router.get('/register',authMiddleware.oturumAcilmamis, authController.registerFormunuGoster);
router.post('/register',authMiddleware.oturumAcilmamis,validatorMiddleware.validateNewUser(), authController.register);


router.get('/forget-password',authMiddleware.oturumAcilmamis, authController.forgetPasswordFormunuGoster);
router.post('/forget-password',authMiddleware.oturumAcilmamis,validatorMiddleware.validateEmail(), authController.forgetPassword);

router.get('/reset-password/:id/:token',authController.yeniSifreFormuGoster);
router.get('/reset-password',authController.yeniSifreFormuGoster);
router.post('/reset-password',validatorMiddleware.validateNewPassword(),authController.yeniSifreyiKaydet);




module.exports = router;