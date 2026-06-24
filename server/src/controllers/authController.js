import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = signToken(user._id);
    return res.status(201).json({
      success: true,
      data: { token, user: user.toSafeJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    return res.status(200).json({
      success: true,
      data: { token, user: user.toSafeJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: { user: req.user.toSafeJSON() },
  });
};
