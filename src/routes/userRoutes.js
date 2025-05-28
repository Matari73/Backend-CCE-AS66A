import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { userSchema } from '../schemas/user.schema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', authMiddleware, validateSchema(userSchema), updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;