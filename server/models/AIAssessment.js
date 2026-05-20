const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'theory', 'coding', 'scenario'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'expert'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  codeSnippet: {
    type: String,
    default: ''
  },
  options: {
    type: [String],
    default: undefined
  },
  correctOptionIndex: {
    type: Number,
    default: undefined
  },
  idealAnswer: {
    type: String,
    required: true
  }
});

const evaluationSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  feedback: {
    type: String,
    required: true
  }
});

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  }
});

const skillRatingSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true
  },
  rating: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    required: true
  }
});

const aiAssessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  questions: {
    type: [questionSchema],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  answers: {
    type: [answerSchema],
    default: []
  },
  evaluation: {
    type: [evaluationSchema],
    default: []
  },
  totalScore: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  skillRatings: {
    type: [skillRatingSchema],
    default: []
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('AIAssessment', aiAssessmentSchema);
