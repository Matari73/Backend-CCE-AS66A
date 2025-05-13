import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { userSchema } from '../schemas/user.schema.js';
import { validateSchema } from '../middlewares/validateSchema.js';

const router = express.Router();

router.post('/register', validateSchema(userSchema), register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

export default router;