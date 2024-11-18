import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Chat from '../models/chat.js';
import Message from '../models/message.js';

const router = express.Router();

// Get user's chats
router.get('/', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar status')
      .populate('lastMessage');
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Create new chat
router.post('/',
  authenticate,
  [
    body('participants').isArray().notEmpty(),
    body('type').isIn(['private', 'group']),
    body('name').if(body('type').equals('group')).notEmpty()
  ],
  async (req, res) => {
    try {
      const { type, name, participants } = req.body;
      
      if (type === 'private' && participants.length !== 1) {
        return res.status(400).json({
          message: 'Private chat must have exactly one participant'
        });
      }

      const chat = await Chat.create({
        type,
        name,
        participants: [...participants, req.user._id],
        admins: type === 'group' ? [req.user._id] : []
      });

      res.status(201).json(await chat.populate('participants'));
    } catch (error) {
      res.status(500).json({ message: 'Error creating chat' });
    }
  }
);

// Get chat messages
router.get('/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { before } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    const query = { chat: chatId };
    if (before) query.createdAt = { $lt: before };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

export default router;