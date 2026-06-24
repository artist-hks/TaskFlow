import Board from '../models/Board.js';
import Task from '../models/Task.js';

// Helper: ensure the board exists and is owned by the requesting user.
async function assertBoardOwnership(boardId, userId, res) {
  const board = await Board.findById(boardId);
  if (!board) {
    res.status(404).json({ success: false, message: 'Board not found' });
    return null;
  }
  if (board.owner.toString() !== userId.toString()) {
    res
      .status(403)
      .json({ success: false, message: 'You do not have access to this board' });
    return null;
  }
  return board;
}

// Helper: load a task and enforce ownership.
async function loadOwnedTask(taskId, userId, res) {
  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return null;
  }
  if (task.owner.toString() !== userId.toString()) {
    res
      .status(403)
      .json({ success: false, message: 'You do not have access to this task' });
    return null;
  }
  return task;
}

// GET /api/boards/:boardId/tasks
export const listTasks = async (req, res, next) => {
  try {
    const board = await assertBoardOwnership(
      req.params.boardId,
      req.user._id,
      res
    );
    if (!board) return;

    const tasks = await Task.find({ board: board._id }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/boards/:boardId/tasks
export const createTask = async (req, res, next) => {
  try {
    const board = await assertBoardOwnership(
      req.params.boardId,
      req.user._id,
      res
    );
    if (!board) return;

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedEffort,
      aiSuggestion,
    } = req.body;

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      estimatedEffort: estimatedEffort || '',
      aiSuggestion: aiSuggestion || undefined,
      board: board._id,
      owner: req.user._id,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await loadOwnedTask(req.params.id, req.user._id, res);
    if (!task) return;

    const fields = [
      'title',
      'description',
      'status',
      'priority',
      'dueDate',
      'estimatedEffort',
      'aiSuggestion',
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        task[f] = req.body[f] === '' && f === 'dueDate' ? undefined : req.body[f];
      }
    }
    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await loadOwnedTask(req.params.id, req.user._id, res);
    if (!task) return;

    task.status = req.body.status;
    await task.save();

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await loadOwnedTask(req.params.id, req.user._id, res);
    if (!task) return;

    await task.deleteOne();
    return res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
