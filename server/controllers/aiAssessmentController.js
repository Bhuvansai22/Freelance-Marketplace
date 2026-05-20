const AIAssessment = require('../models/AIAssessment');
const User = require('../models/User');
const aiService = require('../utils/aiService');

// @desc    Generate resume-based dynamic skill assessment
// @route   POST /api/ai-assessments/generate
// @access  Private/Freelancer
exports.generateAssessment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Gather all profile and resume-recommended skills
    const profileSkills = Array.isArray(user.skills) ? user.skills : [];
    const recommendedSkills = Array.isArray(user.resumeAnalysis?.recommendedSkills) 
      ? user.resumeAnalysis.recommendedSkills 
      : [];
    
    let skills = [...profileSkills, ...recommendedSkills]
      .map(s => s.trim())
      .filter((v, i, self) => v && self.indexOf(v) === i); // Deduplicate

    // 1.5. If the freelancer selects a specific skill to test, validate and use only that skill
    const { selectedSkill } = req.body;
    if (selectedSkill && typeof selectedSkill === 'string' && selectedSkill.trim().length > 0) {
      const normalizedSkill = selectedSkill.trim().toLowerCase();
      const allSkills = [...profileSkills, ...recommendedSkills].map(s => s.toLowerCase().trim());
      
      if (allSkills.includes(normalizedSkill)) {
        const originalSkill = [...profileSkills, ...recommendedSkills].find(s => s.toLowerCase().trim() === normalizedSkill) || selectedSkill;
        skills = [originalSkill.trim()];
      } else {
        return res.status(400).json({ message: 'Selected skill must exist on your resume or profile skills list.' });
      }
    }

    // Fallback if no skills are detected
    if (skills.length === 0) {
      skills = ['JavaScript', 'React', 'Node.js'];
    }

    // 2. Terminate any outstanding pending assessments first to ensure clean state
    await AIAssessment.deleteMany({ user: req.user.id, status: 'pending' });

    // 3. Generate questions via AI service
    const generated = await aiService.generateAIAssessment(skills);

    // 4. Create the assessment in DB
    const assessment = await AIAssessment.create({
      user: req.user.id,
      skills,
      questions: generated.questions,
      status: 'pending'
    });

    // 5. Clean questions (strip correctOptionIndex and idealAnswer for security/anti-cheating)
    const cleanQuestions = assessment.questions.map(q => ({
      _id: q._id,
      type: q.type,
      difficulty: q.difficulty,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      options: q.options
    }));

    res.status(201).json({
      _id: assessment._id,
      skills: assessment.skills,
      questions: cleanQuestions,
      status: assessment.status,
      createdAt: assessment.createdAt
    });
  } catch (error) {
    console.error('Error generating AI assessment:', error);
    res.status(500).json({ message: 'Error generating skill assessment. Please try again.' });
  }
};

// @desc    Submit assessment answers and evaluate using AI
// @route   POST /api/ai-assessments/submit
// @access  Private/Freelancer
exports.submitAssessment = async (req, res) => {
  try {
    const { assessmentId, answers } = req.body; // answers: [{ questionIndex, userAnswer }]

    if (!assessmentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid submission parameters' });
    }

    // 1. Fetch the pending assessment
    const assessment = await AIAssessment.findOne({
      _id: assessmentId,
      user: req.user.id,
      status: 'pending'
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Active or pending assessment session not found' });
    }

    // 2. Invoke the AI evaluation engine
    const evaluationResult = await aiService.evaluateAIAssessment(assessment.questions, answers);

    // 3. Update the assessment record
    assessment.answers = answers;
    assessment.evaluation = evaluationResult.evaluation;
    assessment.totalScore = evaluationResult.totalScore || 0;
    assessment.passed = evaluationResult.passed || false;
    assessment.skillRatings = evaluationResult.skillRatings || [];
    assessment.status = 'completed';
    assessment.completedAt = new Date();

    await assessment.save();

    // 4. Award verified skill badges if assessment passed
    if (assessment.passed) {
      const user = await User.findById(req.user.id);
      if (user) {
        if (!user.verifiedBadges) {
          user.verifiedBadges = [];
        }
        
        user.isVerified = true;
        
        // Add all tested skills to verifiedBadges list
        assessment.skills.forEach(skill => {
          const normSkill = skill.trim().toLowerCase();
          if (!user.verifiedBadges.includes(normSkill)) {
            user.verifiedBadges.push(normSkill);
          }
        });
        
        await user.save();
      }
    }

    res.json(assessment);
  } catch (error) {
    console.error('Error submitting AI assessment:', error);
    res.status(500).json({ message: 'Error grading your assessment. Please try again.' });
  }
};

// @desc    Get active/pending assessment in progress
// @route   GET /api/ai-assessments/active
// @access  Private/Freelancer
exports.getActiveAssessment = async (req, res) => {
  try {
    const assessment = await AIAssessment.findOne({
      user: req.user.id,
      status: 'pending'
    });

    if (!assessment) {
      return res.json(null);
    }

    // Strip secure answers before responding
    const cleanQuestions = assessment.questions.map(q => ({
      _id: q._id,
      type: q.type,
      difficulty: q.difficulty,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      options: q.options
    }));

    res.json({
      _id: assessment._id,
      skills: assessment.skills,
      questions: cleanQuestions,
      status: assessment.status,
      createdAt: assessment.createdAt
    });
  } catch (error) {
    console.error('Error fetching active assessment:', error);
    res.status(500).json({ message: 'Error retrieving assessment status' });
  }
};

// @desc    Get completed assessments history
// @route   GET /api/ai-assessments/history
// @access  Private/Freelancer
exports.getHistory = async (req, res) => {
  try {
    const history = await AIAssessment.find({
      user: req.user.id,
      status: 'completed'
    }).sort({ completedAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({ message: 'Error retrieving assessment history' });
  }
};
