import passport from 'passport';
import { verifyToken } from '../utils/auth.js';

export const authenticate = passport.authenticate('jwt', { session: false });

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

export const isVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      message: 'Please verify your email address'
    });
  }
  next();
};