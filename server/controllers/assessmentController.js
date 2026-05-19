const AssessmentQuestion = require('../models/AssessmentQuestion');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const User = require('../models/User');

// Helper to seed questions if database is empty
const seedQuestionsIfNeeded = async () => {
  const count = await AssessmentQuestion.countDocuments();
  if (count > 0) return;

  const defaultQuestions = [
    // JavaScript
    {
      topic: 'javascript',
      question: 'Which of the following is not a JavaScript data type?',
      options: ['Undefined', 'Number', 'Boolean', 'Float'],
      correctOptionIndex: 3,
    },
    {
      topic: 'javascript',
      question: 'Which company developed JavaScript?',
      options: ['Netscape', 'Microsoft', 'Google', 'Apple'],
      correctOptionIndex: 0,
    },
    {
      topic: 'javascript',
      question: 'What is the correct way to write a JavaScript array?',
      options: [
        'var txt = new Array(1:"tim", 2:"kim")',
        'var names = ["tim", "kim"]',
        'var names = (1:"tim", 2:"kim")',
        'var names = "tim", "kim"',
      ],
      correctOptionIndex: 1,
    },
    // React
    {
      topic: 'react',
      question: 'What is a state in React?',
      options: [
        'A permanent storage storage',
        'An internal data store local to a component',
        'A global variable',
        'None of the above',
      ],
      correctOptionIndex: 1,
    },
    {
      topic: 'react',
      question: 'Which hook is used to perform side effects in functional components?',
      options: ['useState', 'useContext', 'useEffect', 'useReducer'],
      correctOptionIndex: 2,
    },
    // HTML/CSS
    {
      topic: 'html-css',
      question: 'What does CSS stand for?',
      options: [
        'Computer Style Sheets',
        'Cascading Style Sheets',
        'Creative Style Sheets',
        'Colorful Style Sheets',
      ],
      correctOptionIndex: 1,
    },
    {
      topic: 'html-css',
      question: 'Which HTML tag is used to define an internal style sheet?',
      options: ['<script>', '<css>', '<style>', '<link>'],
      correctOptionIndex: 2,
    },
  ];

  await AssessmentQuestion.insertMany(defaultQuestions);
  console.log('Assessment questions seeded successfully.');
};

// Seed questions on startup/first load
seedQuestionsIfNeeded().catch(console.error);

// @desc    Get questions for an assessment
// @route   GET /api/assessments/:topic
// @access  Private/Freelancer
exports.getQuestions = async (req, res) => {
  try {
    const { topic } = req.params;
    
    // Fetch random 5 questions for this topic
    const questions = await AssessmentQuestion.aggregate([
      { $match: { topic } },
      { $sample: { size: 5 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this topic' });
    }

    // Hide correct answer index from user
    const userQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.json(userQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit an assessment and score it
// @route   POST /api/assessments/:topic/submit
// @access  Private/Freelancer
exports.submitAssessment = async (req, res) => {
  try {
    const { topic } = req.params;
    const { answers } = req.body; // array of { questionId, selectedOptionIndex }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid submission data' });
    }

    let correctCount = 0;
    const totalQuestions = answers.length;

    for (const ans of answers) {
      const q = await AssessmentQuestion.findById(ans.questionId);
      if (q && q.correctOptionIndex === ans.selectedOptionIndex) {
        correctCount++;
      }
    }

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 70; // 70% passing threshold

    // Save attempt
    await AssessmentAttempt.create({
      user: req.user.id,
      topic,
      score: percentage,
      passed,
    });

    // If passed, assign verified badge to User profile
    if (passed) {
      const user = await User.findById(req.user.id);
      if (user && !user.verifiedBadges.includes(topic)) {
        user.verifiedBadges.push(topic);
        await user.save();
      }
    }

    res.json({
      score: percentage,
      passed,
      correctCount,
      totalQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
