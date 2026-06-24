import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — verifies the JWT from the Authorization header and attaches
 * the authenticated user document to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — invalid or expired token',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
