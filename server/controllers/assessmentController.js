const AssessmentQuestion = require('../models/AssessmentQuestion');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const User = require('../models/User');

// Helper to seed questions (clears and seeds to ensure latest questions)
const seedQuestionsIfNeeded = async () => {
  // Clear any existing assessment questions first to ensure the updated ones are loaded
  await AssessmentQuestion.deleteMany({});

  const defaultQuestions = [
    // JavaScript (7 Questions)
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
    {
      topic: 'javascript',
      question: 'What is the output of "typeof null" in JavaScript?',
      options: ['"null"', '"object"', '"undefined"', '"string"'],
      correctOptionIndex: 1,
    },
    {
      topic: 'javascript',
      question: 'Which method adds one or more elements to the end of an array and returns the new length?',
      options: ['pop()', 'push()', 'join()', 'shift()'],
      correctOptionIndex: 1,
    },
    {
      topic: 'javascript',
      question: 'Which statement is true about closures in JavaScript?',
      options: [
        'They are only created when using the var keyword',
        'They allow inner functions to access the outer function scope',
        'They are used to declare global variables only',
        'They automatically delete private variables from memory immediately',
      ],
      correctOptionIndex: 1,
    },
    {
      topic: 'javascript',
      question: 'What is the main purpose of Promise.all()?',
      options: [
        'Resolves only if all promises in the iterable resolve',
        'Resolves if at least one promise resolves',
        'Rejects if all promises resolve successfully',
        'Runs promises in a synchronous blocking sequence',
      ],
      correctOptionIndex: 0,
    },

    // React (7 Questions)
    {
      topic: 'react',
      question: 'What is a state in React?',
      options: [
        'A permanent storage mechanism like localStorage',
        'An internal data store local to a component',
        'A global variable available across all files',
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
    {
      topic: 'react',
      question: 'What is the virtual DOM in React?',
      options: [
        'A direct duplicate of the HTML DOM in the browser',
        'An in-memory representation of the real DOM, synced via reconciliation',
        'A browser extension for DOM inspection',
        'A styling framework for layout components',
      ],
      correctOptionIndex: 1,
    },
    {
      topic: 'react',
      question: 'How can you pass data from a parent component to a child component?',
      options: ['Using state', 'Using props', 'Using window global variables', 'Using ref objects'],
      correctOptionIndex: 1,
    },
    {
      topic: 'react',
      question: 'What is the primary purpose of keys in React lists?',
      options: [
        'To uniquely identify elements and help React determine which items changed, added, or removed',
        'To apply inline styles to list items dynamically',
        'To bind click handlers to specific list items automatically',
        'To secure list data against XSS vulnerabilities',
      ],
      correctOptionIndex: 0,
    },
    {
      topic: 'react',
      question: 'Which of the following hooks returns a memoized value?',
      options: ['useCallback', 'useMemo', 'useRef', 'useImperativeHandle'],
      correctOptionIndex: 1,
    },
    {
      topic: 'react',
      question: 'What is the correct way to handle routing in a single-page React application?',
      options: [
        'Using simple <a> tags exclusively',
        'Using the <Link> component to navigate without refreshing the page',
        'Manipulating window.location.href directly on clicks',
        'React applications do not support routing',
      ],
      correctOptionIndex: 1,
    },

    // HTML/CSS (7 Questions)
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
    {
      topic: 'html-css',
      question: 'Which of the following is the correct CSS selector for an element with the id "header"?',
      options: ['.header', '#header', '*header', 'header'],
      correctOptionIndex: 1,
    },
    {
      topic: 'html-css',
      question: 'How do you create a responsive layout using CSS?',
      options: [
        'Using absolute pixel dimensions for all elements',
        'Using CSS media queries, flexbox, and grid layouts',
        'By writing JavaScript window resize listeners exclusively',
        'Responsive layouts are handled automatically by standard HTML tables',
      ],
      correctOptionIndex: 1,
    },
    {
      topic: 'html-css',
      question: 'What is the default value of the "position" property in CSS?',
      options: ['relative', 'absolute', 'static', 'fixed'],
      correctOptionIndex: 2,
    },
    {
      topic: 'html-css',
      question: 'In Flexbox, which property is used to align flex items along the cross axis?',
      options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
      correctOptionIndex: 1,
    },
    {
      topic: 'html-css',
      question: 'What is the difference between display: none and visibility: hidden?',
      options: [
        'They are completely identical in every way',
        'display: none removes the element from the layout; visibility: hidden hides it but preserves its space',
        'visibility: hidden removes it from the layout; display: none preserves its space',
        'display: none is only supported in legacy CSS engines',
      ],
      correctOptionIndex: 1,
    },
  ];

  await AssessmentQuestion.insertMany(defaultQuestions);
  console.log('Assessment questions updated and seeded successfully.');
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
