const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/emailService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'freelancer',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all freelancers
// @route   GET /api/auth/freelancers
// @access  Private
exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer' }).select('-password');
    res.json(freelancers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, phnumber, dob, resume, skills, title, bio, hourlyRate, profileType, showBadges, visibleBadges } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phnumber !== undefined) user.phnumber = phnumber;
    if (dob !== undefined) user.dob = dob;
    if (resume !== undefined) user.resume = resume;
    if (profileType !== undefined) user.profileType = profileType;
    if (showBadges !== undefined) user.showBadges = showBadges;
    if (visibleBadges !== undefined) user.visibleBadges = visibleBadges;
    
    // Skills formatting support (string or array mapping)
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;
    if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate);

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phnumber: updatedUser.phnumber,
      dob: updatedUser.dob,
      resume: updatedUser.resume,
      skills: updatedUser.skills,
      title: updatedUser.title,
      bio: updatedUser.bio,
      hourlyRate: updatedUser.hourlyRate,
      profileType: updatedUser.profileType,
      verifiedBadges: updatedUser.verifiedBadges,
      showBadges: updatedUser.showBadges,
      visibleBadges: updatedUser.visibleBadges,
      rating: updatedUser.rating,
      reviewsCount: updatedUser.reviewsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to user
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Determine the frontend origin dynamically
    const origin = req.headers.origin || 'http://localhost:5173';

    // Send email
    const previewUrl = await sendResetEmail(user.email, resetToken, origin);

    res.status(200).json({ 
      message: 'Recovery email sent successfully',
      previewUrl: process.env.NODE_ENV === 'development' ? previewUrl : undefined,
      resetUrl: process.env.NODE_ENV === 'development' ? `${origin}/reset-password/${resetToken}` : undefined
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Failed to send recovery email. Server error.' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.token;

    // Hash token to search database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Failed to reset password. Server error.' });
  }
};


