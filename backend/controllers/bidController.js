const { validationResult } = require('express-validator');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');

// @desc    Get all bids for a gig
// @route   GET /api/bids/:gigId
// @access  Private (Gig owner only)
const getBidsForGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns the gig
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view bids for this gig'
      });
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bids'
    });
  }
};

// @desc    Create new bid
// @route   POST /api/bids
// @access  Private
const createBid = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { gigId, message, price } = req.body;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on assigned gigs'
      });
    }

    // Check if user owns the gig
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on your own gig'
      });
    }

    // Check if user already bid on this gig
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already bid on this gig'
      });
    }

    // Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    // Populate freelancer details
    await bid.populate('freelancer', 'name email');

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bid'
    });
  }
};

// @desc    Hire freelancer (update bid status and gig status)
// @route   PATCH /api/bids/:bidId/hire
// @access  Private (Gig owner only)
const hireFreelancer = async (req, res) => {
  const session = await Bid.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(req.params.bidId).session(session);

    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Get the gig
    const gig = await Gig.findById(bid.gigId).session(session);

    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns the gig
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: 'Not authorized to hire for this gig'
      });
    }

    // Check if gig is open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Gig is already assigned'
      });
    }

    // Update the selected bid to hired
    await Bid.findByIdAndUpdate(
      req.params.bidId,
      { status: 'hired' },
      { session }
    );

    // Update all other bids for this gig to rejected
    await Bid.updateMany(
      {
        gigId: bid.gigId,
        _id: { $ne: req.params.bidId }
      },
      { status: 'rejected' },
      { session }
    );

    // Update gig status to assigned
    await Gig.findByIdAndUpdate(
      bid.gigId,
      { status: 'assigned' },
      { session }
    );

    await session.commitTransaction();

    // Populate data for response
    const updatedBid = await Bid.findById(req.params.bidId)
      .populate('freelancer', 'name email')
      .populate({
        path: 'gig',
        populate: { path: 'owner', select: 'name email' }
      });

    // Send real-time notification to the hired freelancer
    const notification = {
      type: 'hired',
      message: `Congratulations! You have been hired for "${gig.title}"`,
      gig: {
        id: gig._id,
        title: gig.title,
        budget: gig.budget
      },
      bid: {
        id: updatedBid._id,
        price: updatedBid.price
      },
      timestamp: new Date()
    };

    // Emit notification using global notifyUser function
    if (global.notifyUser) {
      global.notifyUser(bid.freelancerId.toString(), 'notification', notification);
    }

    res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully',
      data: updatedBid
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Hire freelancer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while hiring freelancer'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get user's bids
// @route   GET /api/bids/user/me
// @access  Private
const getUserBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate({
        path: 'gigId',
        select: 'title description budget status ownerId',
        populate: { path: 'ownerId', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    // Map gigId to gig for frontend compatibility (keep both)
    const formattedBids = bids.map(bid => {
      const bidObj = bid.toObject();
      if (bidObj.gigId && typeof bidObj.gigId === 'object') {
        bidObj.gig = bidObj.gigId;
        // Keep gigId as string for links
        bidObj.gigId = bidObj.gigId._id || bidObj.gigId;
      }
      return bidObj;
    });

    res.status(200).json({
      success: true,
      count: formattedBids.length,
      data: formattedBids
    });
  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user bids'
    });
  }
};

module.exports = {
  getBidsForGig,
  createBid,
  hireFreelancer,
  getUserBids
};