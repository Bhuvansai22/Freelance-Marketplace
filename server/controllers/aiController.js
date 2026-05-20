const aiService = require('../utils/aiService');
const Project = require('../models/Project');
const User = require('../models/User');
const pdfParse = require('pdf-parse');

exports.matchSkills = async (req, res) => {
  try {
    const { projectId } = req.body;
    const freelancerId = req.user.id;

    const project = await Project.findById(projectId);
    const freelancer = await User.findById(freelancerId);

    if (!project || !freelancer) {
      return res.status(404).json({ message: 'Project or User not found' });
    }

    const matchData = await aiService.matchSkills(project.skillsRequired, freelancer.skills);
    res.json(matchData);
  } catch (error) {
    console.error('Skill match error:', error);
    res.status(500).json({ message: 'Error analyzing skills' });
  }
};

exports.generateProposal = async (req, res) => {
  try {
    const { projectId } = req.body;
    const freelancerId = req.user.id;

    const project = await Project.findById(projectId);
    const freelancer = await User.findById(freelancerId);

    if (!project || !freelancer) {
      return res.status(404).json({ message: 'Project or User not found' });
    }

    const proposalData = await aiService.generateProposal(
      { title: project.title, description: project.description, skills: project.skillsRequired },
      { bio: freelancer.bio, skills: freelancer.skills }
    );
    
    res.json(proposalData);
  } catch (error) {
    console.error('Proposal generation error:', error);
    res.status(500).json({ message: 'Error generating proposal' });
  }
};

exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume' });
    }

    // Extract text from PDF buffer using pdf-parse
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from the PDF. Ensure it contains text.' });
    }

    // Run AI analysis
    const analysis = await aiService.analyzeResume(text);

    // Save to User document in database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.resumeAnalysis = {
      score: analysis.score || 0,
      hiringReadiness: analysis.hiringReadiness || 'Beginner',
      missingSkills: analysis.missingSkills || [],
      improvements: analysis.improvements || [],
      portfolioSuggestions: analysis.portfolioSuggestions || [],
      profileLinkSuggestions: analysis.profileLinkSuggestions || [],
      recommendedSkills: analysis.recommendedSkills || [],
      analyzedAt: new Date()
    };

    await user.save();

    res.json(user.resumeAnalysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Error analyzing resume. Please try again.' });
  }
};

exports.getResumeAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.resumeAnalysis || null);
  } catch (error) {
    console.error('Error fetching resume analysis:', error);
    res.status(500).json({ message: 'Error retrieving analysis' });
  }
};

exports.chatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = user.role;
    let contextData = [];

    if (userRole === 'freelancer') {
      // Find active open projects
      const openProjects = await Project.find({ status: 'open' }).populate('client', 'name');
      contextData = openProjects.map(p => ({
        id: p._id,
        title: p.title,
        description: p.description,
        skillsRequired: p.skillsRequired,
        budget: p.budget,
        clientName: p.client?.name || 'Recruiter'
      }));
    } else {
      // Find freelancers matching client's potential needs
      const freelancers = await User.find({ role: 'freelancer' });
      contextData = freelancers.map(f => ({
        id: f._id,
        name: f.name,
        title: f.title || 'Technical Specialist',
        skills: f.skills || [],
        verifiedBadges: f.verifiedBadges || [],
        hourlyRate: f.hourlyRate,
        bio: f.bio || ''
      }));
    }

    const chatbotData = await aiService.getChatbotResponse(userRole, message, contextData);
    res.json(chatbotData);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Error processing chatbot request' });
  }
};

