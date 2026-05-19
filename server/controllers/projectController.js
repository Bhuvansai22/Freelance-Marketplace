const Project = require('../models/Project');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Client
exports.createProject = async (req, res) => {
  try {
    const { title, description, budget, skillsRequired, deadline, milestones } = req.body;

    const project = await Project.create({
      title,
      description,
      client: req.user.id,
      budget,
      skillsRequired,
      deadline,
      milestones: milestones || [],
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects (with search, filter, sorting)
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    const { search, skills, minBudget, maxBudget, sort } = req.query;
    let query = { status: 'open' };

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',');
      query.skillsRequired = { $in: skillsArray };
    }

    // Budget filter
    if (minBudget) {
      query['budget.min'] = { $gte: Number(minBudget) };
    }
    if (maxBudget) {
      query['budget.max'] = { $lte: Number(maxBudget) };
    }

    let queryExec = Project.find(query).populate('client', 'name email');

    // Sorting
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      queryExec = queryExec.sort(sortBy);
    } else {
      queryExec = queryExec.sort('-createdAt');
    }

    const projects = await queryExec;
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email')
      .populate('freelancerAssigned', 'name email skills verifiedBadges');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Client
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user is project client
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Client
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user is project client
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in client's projects
// @route   GET /api/projects/myprojects
// @access  Private/Client
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id }).sort('-createdAt');
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project progress (milestones status and project status by freelancer)
// @route   PUT /api/projects/:id/progress
// @access  Private/Freelancer
exports.updateProjectProgress = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user is the assigned freelancer
    if (!project.freelancerAssigned || project.freelancerAssigned.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update progress. You are not the assigned freelancer.' });
    }

    const { milestones, status } = req.body;

    if (milestones) {
      project.milestones = milestones;
    }
    
    if (status) {
      project.status = status;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate freelancer assigned to a project (fixed rating: 3 stars)
// @route   POST /api/projects/:id/rate
// @access  Private/Client
exports.rateProjectFreelancer = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user is the project client
    if (project.client.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to rate for this project' });
    }

    // Check if there is an assigned freelancer
    if (!project.freelancerAssigned) {
      return res.status(400).json({ message: 'No freelancer assigned to this project' });
    }

    const User = require('../models/User');
    const freelancer = await User.findById(project.freelancerAssigned);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Extract rating from req.body (range 1-5), default to 3 stars
    let ratingGiven = Number(req.body.rating) || 3;
    if (ratingGiven < 1 || ratingGiven > 5) {
      ratingGiven = 3;
    }

    // Calculate new average rating
    const currentRating = freelancer.rating || 0;
    const currentReviewsCount = freelancer.reviewsCount || 0;

    const newReviewsCount = currentReviewsCount + 1;
    const newRating = ((currentRating * currentReviewsCount) + ratingGiven) / newReviewsCount;

    freelancer.rating = parseFloat(newRating.toFixed(2));
    freelancer.reviewsCount = newReviewsCount;

    await freelancer.save();

    res.json({
      message: `Freelancer rated successfully with a ${ratingGiven}-star rating!`,
      freelancer: {
        _id: freelancer._id,
        name: freelancer.name,
        rating: freelancer.rating,
        reviewsCount: freelancer.reviewsCount,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate client of a project
// @route   POST /api/projects/:id/rate-client
// @access  Private/Freelancer
exports.rateProjectClient = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user is the project assigned freelancer
    if (!project.freelancerAssigned || project.freelancerAssigned.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to rate the client of this project' });
    }

    const User = require('../models/User');
    const client = await User.findById(project.client);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Extract rating from req.body (range 1-5), default to 3 stars
    let ratingGiven = Number(req.body.rating) || 3;
    if (ratingGiven < 1 || ratingGiven > 5) {
      ratingGiven = 3;
    }

    // Calculate new average rating for client
    const currentRating = client.rating || 0;
    const currentReviewsCount = client.reviewsCount || 0;

    const newReviewsCount = currentReviewsCount + 1;
    const newRating = ((currentRating * currentReviewsCount) + ratingGiven) / newReviewsCount;

    client.rating = parseFloat(newRating.toFixed(2));
    client.reviewsCount = newReviewsCount;

    await client.save();

    res.json({
      message: `Client rated successfully with a ${ratingGiven}-star rating!`,
      client: {
        _id: client._id,
        name: client.name,
        rating: client.rating,
        reviewsCount: client.reviewsCount,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject/Cancel the active freelancer and reopen project
// @route   POST /api/projects/:id/reject
// @access  Private/Client
exports.rejectProjectFreelancer = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure user is the project client
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to perform this action' });
    }

    if (!project.freelancerAssigned) {
      return res.status(400).json({ message: 'No freelancer assigned to this project' });
    }

    const Bid = require('../models/Bid');
    // Find the accepted bid for this freelancer on this project
    const acceptedBid = await Bid.findOne({
      project: project._id,
      freelancer: project.freelancerAssigned,
      status: 'accepted'
    });

    if (acceptedBid) {
      acceptedBid.status = 'rejected';
      await acceptedBid.save();
    }

    // Reopen the project and unassign freelancer
    project.status = 'open';
    project.freelancerAssigned = null;

    // Reset milestones status to pending
    if (project.milestones) {
      project.milestones = project.milestones.map(m => {
        const mObj = m.toObject();
        mObj.status = 'pending';
        return mObj;
      });
    }

    await project.save();

    res.json({ message: 'Project reassignment cancelled. Freelancer rejected and project reopened.', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
