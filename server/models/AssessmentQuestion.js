const mongoose = require('mongoose');

const assessmentQuestionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    enum: ['dsa', 'html-css', 'javascript', 'react', 'node', 'dbms', 'aptitude', 'problem-solving'],
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length === 4, 'There must be exactly 4 options'],
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  }
});

module.exports = mongoose.model('AssessmentQuestion', assessmentQuestionSchema);
