import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from './models/User.js';
import Board from './models/Board.js';
import Task from './models/Task.js';

dotenv.config();

const DEMO_EMAIL = 'demo@taskflow.app';
const DEMO_PASSWORD = 'demo1234';

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set. Add it to server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Reset demo user's existing data for a clean, repeatable seed.
  let user = await User.findOne({ email: DEMO_EMAIL });
  if (user) {
    const boards = await Board.find({ owner: user._id });
    const boardIds = boards.map((b) => b._id);
    await Task.deleteMany({ board: { $in: boardIds } });
    await Board.deleteMany({ owner: user._id });
    console.log('🧹 Cleared existing demo boards & tasks');
  } else {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    user = await User.create({
      name: 'Demo User',
      email: DEMO_EMAIL,
      passwordHash,
    });
    console.log('👤 Created demo user');
  }

  const board = await Board.create({
    title: 'Product Launch',
    description: 'Everything needed to ship the v1 launch.',
    owner: user._id,
  });
  console.log('📋 Created demo board:', board.title);

  const tasks = [
    {
      title: 'Write launch announcement',
      description: 'Draft the blog post and email copy for the public launch.',
      status: 'todo',
      priority: 'high',
      dueDate: daysFromNow(2),
      estimatedEffort: 'M',
    },
    {
      title: 'Fix login redirect bug',
      description: 'Users land on a blank page after login on Safari.',
      status: 'todo',
      priority: 'high',
      dueDate: daysFromNow(-1), // overdue
      estimatedEffort: 'S',
    },
    {
      title: 'Design dashboard charts',
      description:
        'Create the tasks-by-status donut and tasks-by-priority bar charts.',
      status: 'in-progress',
      priority: 'medium',
      dueDate: daysFromNow(4),
      estimatedEffort: 'M',
    },
    {
      title: 'Refactor API error handling',
      description:
        'Centralize error responses and remove duplicated try/catch logic across controllers.',
      status: 'in-progress',
      priority: 'low',
      dueDate: daysFromNow(7),
      estimatedEffort: 'L',
    },
    {
      title: 'Set up MongoDB Atlas',
      description: 'Provision the production cluster and configure network access.',
      status: 'done',
      priority: 'medium',
      dueDate: daysFromNow(-3),
      estimatedEffort: 'S',
    },
    {
      title: 'Add JWT authentication',
      description: 'Implement register/login with hashed passwords and 7-day tokens.',
      status: 'done',
      priority: 'high',
      dueDate: daysFromNow(-5),
      estimatedEffort: 'M',
    },
  ];

  for (const t of tasks) {
    await Task.create({ ...t, board: board._id, owner: user._id });
  }
  console.log(`✅ Created ${tasks.length} demo tasks`);

  console.log('\n--- Demo credentials ---');
  console.log(`Email:    ${DEMO_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log('------------------------\n');

  await mongoose.disconnect();
  console.log('🌱 Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
