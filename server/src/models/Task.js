import mongoose from 'mongoose';

const aiSuggestionSchema = new mongoose.Schema(
  {
    effort: { type: String },
    suggestedDueDate: { type: Date },
    reasoning: { type: String },
    fallback: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    estimatedEffort: {
      type: String,
      default: '',
    },
    aiSuggestion: {
      type: aiSuggestionSchema,
      default: undefined,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
