import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadFile } from '../services/fileUpload.js';
import User from '../models/user.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.patch('/profile',
  authenticate,
  upload.single('avatar'),
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().trim()
  ],
  async (req, res) => {
    try {
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.bio) updates.bio = req.body.bio;

      if (req.file) {
        const fileData = await uploadFile(req.file, 'image');
        updates.avatar = {
          url: fileData.url,
          thumbnailUrl: fileData.thumbnailUrl
        };
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      );

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
);

// Get users list (admin only)
router.get('/',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  }
);

export default router;