import Board from '../models/Board.js';
import Task from '../models/Task.js';

// GET /api/boards
export const listBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({
      updatedAt: -1,
    });

    // Attach a lightweight task count to each board for the dashboard cards.
    const withCounts = await Promise.all(
      boards.map(async (b) => {
        const taskCount = await Task.countDocuments({ board: b._id });
        return { ...b.toObject(), taskCount };
      })
    );

    return res.status(200).json({ success: true, data: withCounts });
  } catch (err) {
    next(err);
  }
};

// POST /api/boards
export const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const board = await Board.create({
      title,
      description: description || '',
      owner: req.user._id,
    });
    return res.status(201).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// Shared helper: load a board and enforce ownership.
async function loadOwnedBoard(req, res) {
  const board = await Board.findById(req.params.id);
  if (!board) {
    res.status(404).json({ success: false, message: 'Board not found' });
    return null;
  }
  if (board.owner.toString() !== req.user._id.toString()) {
    res
      .status(403)
      .json({ success: false, message: 'You do not have access to this board' });
    return null;
  }
  return board;
}

// GET /api/boards/:id
export const getBoard = async (req, res, next) => {
  try {
    const board = await loadOwnedBoard(req, res);
    if (!board) return;
    return res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// PUT /api/boards/:id
export const updateBoard = async (req, res, next) => {
  try {
    const board = await loadOwnedBoard(req, res);
    if (!board) return;

    const { title, description } = req.body;
    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    await board.save();

    return res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/boards/:id  (cascade delete tasks)
export const deleteBoard = async (req, res, next) => {
  try {
    const board = await loadOwnedBoard(req, res);
    if (!board) return;

    await Task.deleteMany({ board: board._id });
    await board.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: 'Board and its tasks deleted' });
  } catch (err) {
    next(err);
  }
};
