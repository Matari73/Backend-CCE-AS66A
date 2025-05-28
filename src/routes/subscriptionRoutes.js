import express from 'express';
import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription
} from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { subscriptionSchema } from '../schemas/subscription.schema.js';

const router = express.Router();

router.get('/', getAllSubscriptions);
router.get('/:subscriptionId', getSubscriptionById);
router.post('/', authMiddleware, validateSchema(subscriptionSchema), createSubscription);
router.put('/:subscriptionId', authMiddleware, validateSchema(subscriptionSchema), updateSubscription);
router.delete('/:subscriptionId', authMiddleware, deleteSubscription);

export default router;
