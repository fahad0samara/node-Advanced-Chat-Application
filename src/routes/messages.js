import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { uploadFile } from '../services/fileUpload.js';
import Message from '../models/message.js';
import Chat from '../models/chat.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Send message with attachments
router.post('/',
  authenticate,
  upload.array('attachments', 10),
  [
    body('chatId').notEmpty(),
    body('content.text').if(body('attachments').isEmpty()).notEmpty()
  ],
  async (req, res) => {
    try {
      const { chatId, content, replyTo } = req.body;
      
      const chat = await Chat.findById(chatId);
      if (!chat.participants.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not a chat participant' });
      }

      const attachments = [];
      if (req.files?.length) {
        for (const file of req.files) {
          const fileData = await uploadFile(file);
          attachments.push(fileData);
        }
      }

      const message = await Message.create({
        chat: chatId,
        sender: req.user._id,
        content,
        attachments,
        replyTo
      });

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id
      });

      res.status(201).json(
        await message.populate(['sender', 'replyTo'])
      );
    } catch (error) {
      res.status(500).json({ message: 'Error sending message' });
    }
  }
);

// Edit message
router.patch('/:messageId',
  authenticate,
  [
    body('content.text').notEmpty()
  ],
  async (req, res) => {
    try {
      const message = await Message.findById(req.params.messageId);
      
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not message sender' });
      }

      message.editHistory.push({
        content: message.content.text,
        editedAt: new Date()
      });

      message.content.text = req.body.content.text;
      message.isEdited = true;
      
      await message.save();
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: 'Error editing message' });
    }
  }
);

// Delete message
router.delete('/:messageId', authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not message sender' });
    }

    message.isDeleted = true;
    message.content.text = '';
    message.attachments = [];
    
    await message.save();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message' });
  }
});

export default router;