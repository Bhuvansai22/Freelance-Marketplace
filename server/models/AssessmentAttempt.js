const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
