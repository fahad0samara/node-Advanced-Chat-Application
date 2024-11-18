import Message from '../models/message.js';
import User from '../models/user.js';
import Chat from '../models/chat.js';

export const searchMessages = async (userId, query, options = {}) => {
  const {
    chatId,
    fromDate,
    toDate,
    hasAttachments,
    fromUser,
    limit = 20,
    skip = 0
  } = options;

  // Build search query
  const searchQuery = {
    $and: [
      { 'content.text': { $regex: query, $options: 'i' } },
      { isDeleted: false }
    ]
  };

  // Add filters
  if (chatId) searchQuery.chat = chatId;
  if (fromUser) searchQuery.sender = fromUser;
  if (hasAttachments) searchQuery['attachments.0'] = { $exists: true };
  if (fromDate || toDate) {
    searchQuery.createdAt = {};
    if (fromDate) searchQuery.createdAt.$gte = new Date(fromDate);
    if (toDate) searchQuery.createdAt.$lte = new Date(toDate);
  }

  // Get user's chats
  const userChats = await Chat.find({ participants: userId }).select('_id');
  searchQuery.chat = { $in: userChats.map(c => c._id) };

  return Message.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name avatar')
    .populate('replyTo');
};

export const searchUsers = async (query) => {
  return User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).select('name email avatar status');
};

export const searchChats = async (userId, query) => {
  return Chat.find({
    participants: userId,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { type: 'private' }
    ]
  })
  .populate({
    path: 'participants',
    match: {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    },
    select: 'name avatar status'
  })
  .populate('lastMessage');
};