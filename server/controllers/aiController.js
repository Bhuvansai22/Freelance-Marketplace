const aiService = require('../utils/aiService');
const Project = require('../models/Project');
const User = require('../models/User');

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
