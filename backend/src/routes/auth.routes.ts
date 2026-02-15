import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser, refreshToken, accessToken, updateUserProfile, updatePassword, deleteUser } from '../controllers/user.controllers';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/signin', loginUser);
router.post('/refresh-token', refreshToken);

// Protected routes (require authentication middleware)
router.post('/logout', authenticateToken, logoutUser);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/access-token', authenticateToken, accessToken);
router.put('/profile', authenticateToken, updateUserProfile);
router.put('/password', authenticateToken, updatePassword);
router.delete('/account', authenticateToken, deleteUser);

export default router;
