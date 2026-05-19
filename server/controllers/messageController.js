const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, project } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
      project,
    });

    const populatedMessage = await message.populate('sender receiver', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat history between current user and another user
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort('createdAt')
      .populate('sender receiver', 'name email');

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unique users current user has chatted with (Contact List)
// @route   GET /api/messages/contacts/list
// @access  Private
exports.getChatContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort('-createdAt');

    // Extract unique contact IDs
    const contactIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== currentUserId) {
        contactIds.add(msg.sender.toString());
      }
      if (msg.receiver.toString() !== currentUserId) {
        contactIds.add(msg.receiver.toString());
      }
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }, 'name email role title');

    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
