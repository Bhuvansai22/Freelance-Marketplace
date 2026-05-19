const Bid = require('../models/Bid');
const Project = require('../models/Project');

// @desc    Place a bid on a project
// @route   POST /api/bids
// @access  Private/Freelancer
exports.placeBid = async (req, res) => {
  try {
    const { project: projectId, amount, deliveryTime, coverLetter } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'This project is no longer open for bids' });
    }

    // Check if freelancer already bided
    const alreadyBid = await Bid.findOne({ project: projectId, freelancer: req.user.id });
    if (alreadyBid) {
      return res.status(400).json({ message: 'You have already placed a bid on this project' });
    }

    const bid = await Bid.create({
      project: projectId,
      freelancer: req.user.id,
      amount,
      deliveryTime,
      coverLetter,
    });

    res.status(201).json(bid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get bids for a specific project
// @route   GET /api/bids/project/:projectId
// @access  Private
exports.getProjectBids = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner, assigned freelancer or admin can see all bids
    const isOwner = project.client.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to view bids for this project' });
    }

    const bids = await Bid.find({ project: req.params.projectId })
      .populate('freelancer', 'name email skills verifiedBadges rating reviewsCount title bio')
      .sort('-createdAt');

    res.json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user's (freelancer) bids
// @route   GET /api/bids/mybids
// @access  Private/Freelancer
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user.id })
      .populate('project', 'title budget deadline status client')
      .sort('-createdAt');

    res.json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept a bid
// @route   PUT /api/bids/:id/accept
// @access  Private/Client
exports.acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('project');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const project = bid.project;

    // Check authorization
    if (project.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to accept bids for this project' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Project is already in progress or completed' });
    }

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Reject other bids for this project
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    // Update project state
    project.status = 'in-progress';
    project.freelancerAssigned = bid.freelancer;
    await project.save();

    res.json({ message: 'Bid accepted, project is now in progress', bid, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject a bid
// @route   PUT /api/bids/:id/reject
// @access  Private/Client
exports.rejectBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('project');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check authorization
    if (bid.project.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    bid.status = 'rejected';
    await bid.save();

    res.json(bid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
