import { Router } from 'express';
import { body } from 'express-validator';
import {
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';

const router = Router();

router.use(protect);

router
  .route('/:id')
  .put(
    [
      body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Task title cannot be empty'),
      body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
    ],
    validate,
    updateTask
  )
  .delete(deleteTask);

router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['todo', 'in-progress', 'done'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateTaskStatus
);

export default router;
