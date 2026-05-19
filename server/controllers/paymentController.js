const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Project = require('../models/Project');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.log('Razorpay keys not detected in environment. Running in sandbox-mock mode.');
}

// @desc    Create Razorpay Order for a Milestone
// @route   POST /api/payments/order
// @access  Private/Client
exports.createOrder = async (req, res) => {
  try {
    const { projectId, milestoneId, amount } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status === 'paid') {
      return res.status(400).json({ message: 'Milestone is already paid' });
    }

    let orderId = `mock_order_${Date.now()}`;

    // If Razorpay keys are configured, create real Razorpay Order
    if (razorpay) {
      const options = {
        amount: amount * 100, // amount in paisa
        currency: 'USD',
        receipt: `receipt_${milestoneId}`,
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Save initial pending payment record
    await Payment.create({
      project: projectId,
      client: req.user.id,
      freelancer: project.freelancerAssigned,
      milestoneId,
      amount,
      razorpayOrderId: orderId,
      status: 'pending',
    });

    res.status(201).json({
      orderId,
      amount,
      currency: 'USD',
      isMock: !razorpay,
      keyId: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Razorpay Signature and release payment
// @route   POST /api/payments/verify
// @access  Private/Client
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, isMock } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Signature verification logic
    if (!isMock && razorpay) {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpaySignature) {
        payment.status = 'failed';
        await payment.save();
        return res.status(400).json({ message: 'Invalid payment signature verification' });
      }
    }

    // Successful payment
    payment.status = 'paid';
    payment.razorpayPaymentId = razorpayPaymentId || `mock_pay_${Date.now()}`;
    await payment.save();

    // Release Milestone payment in Project
    const project = await Project.findById(payment.project);
    if (project) {
      const milestone = project.milestones.id(payment.milestoneId);
      if (milestone) {
        milestone.status = 'paid';
        await project.save();
      }
    }

    res.json({ message: 'Payment verified and milestone released successfully!', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
