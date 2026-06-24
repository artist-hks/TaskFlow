import { Router } from 'express';
import { body } from 'express-validator';
import { suggest } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';

const router = Router();

router.post(
  '/suggest',
  protect,
  [body('title').optional().isString(), body('description').optional().isString()],
  validate,
  suggest
);

export default router;
