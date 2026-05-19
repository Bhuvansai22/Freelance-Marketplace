const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add a bid amount'],
    },
    deliveryTime: {
      type: String,
      required: [true, 'Please add an estimated delivery time (e.g., 5 days)'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Please add a cover letter'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bid', bidSchema);
