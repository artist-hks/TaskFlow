import { getTaskSuggestion } from '../services/aiService.js';

// POST /api/ai/suggest
export const suggest = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const suggestion = await getTaskSuggestion(title || '', description || '');
    return res.status(200).json({ success: true, data: suggestion });
  } catch (err) {
    next(err);
  }
};
