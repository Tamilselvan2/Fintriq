import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { loginSchema, registerSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from './auth.validation';
import { authenticate } from '../../middlewares/authMiddleware';
import { verifyCsrfHeader } from '../../middlewares/csrfMiddleware';
import { uploadProfileImage } from '../../middlewares/uploadMiddleware';

const router = Router();
const authController = new AuthController();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests, please try again later.' },
});

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', verifyCsrfHeader, authController.refresh);
router.post('/logout', verifyCsrfHeader, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, validateRequest(updateProfileSchema), authController.updateProfile);
router.patch('/password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);
router.post('/profile-picture', authenticate, uploadProfileImage.single('image'), authController.uploadProfilePicture);

router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);

export default router;
