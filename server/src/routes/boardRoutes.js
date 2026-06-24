import { Router } from 'express';
import { body } from 'express-validator';
import {
  listBoards,
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/boardController.js';
import {
  listTasks,
  createTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(listBoards)
  .post(
    [body('title').trim().notEmpty().withMessage('Board title is required')],
    validate,
    createBoard
  );

router
  .route('/:id')
  .get(getBoard)
  .put(
    [
      body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Board title cannot be empty'),
    ],
    validate,
    updateBoard
  )
  .delete(deleteBoard);

// Nested task routes scoped to a board.
router
  .route('/:boardId/tasks')
  .get(listTasks)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Task title is required'),
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
    createTask
  );

export default router;
