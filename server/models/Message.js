const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    suspiciousReason: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
