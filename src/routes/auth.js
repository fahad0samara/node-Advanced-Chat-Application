import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import { hashPassword, generateToken, generateVerificationToken } from '../utils/auth.js';
import User from '../models/user.js';

const router = express.Router();

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await hashPassword(password);
      const verificationToken = generateVerificationToken();
      
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        verificationToken
      });

      const token = generateToken(user);
      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed' });
    }
  }
);

// Login
router.post('/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.json({ token, user: req.user });
  }
);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Facebook OAuth
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router;