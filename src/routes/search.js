import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { searchMessages, searchUsers, searchChats } from '../services/search.js';

const router = express.Router();

// Global search across messages, users, and chats
router.get('/', authenticate, async (req, res) => {
  try {
    const { q, type, ...options } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let results = {};

    switch (type) {
      case 'messages':
        results.messages = await searchMessages(req.user._id, q, options);
        break;
      case 'users':
        results.users = await searchUsers(q);
        break;
      case 'chats':
        results.chats = await searchChats(req.user._id, q);
        break;
      default:
        // Search all types if no specific type is provided
        const [messages, users, chats] = await Promise.all([
          searchMessages(req.user._id, q, options),
          searchUsers(q),
          searchChats(req.user._id, q)
        ]);
        results = { messages, users, chats };
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error performing search' });
  }
});

export default router;