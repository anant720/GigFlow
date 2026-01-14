const { validationResult } = require('express-validator');
const Gig = require('../models/Gig');

// @desc    Get all gigs with optional search
// @route   GET /api/gigs
// @access  Public
const getGigs = async (req, res) => {
  try {
    let query = {};

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Only show open gigs by default
    query.status = 'open';

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Gig.countDocuments(query);

    const gigs = await Gig.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json({
      success: true,
      count: gigs.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: gigs
    });
  } catch (error) {
    console.error('Get gigs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gigs'
    });
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
const getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('owner', 'name email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    res.status(200).json({
      success: true,
      data: gig
    });
  } catch (error) {
    console.error('Get gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gig'
    });
  }
};

// @desc    Create new gig
// @route   POST /api/gigs
// @access  Private
const createGig = async (req, res) => {
  try {
    console.log('Creating gig for user:', req.user._id);
    const { title, description, budget } = req.body;

    // Basic validation
    if (!title || !description || !budget) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (title.trim().length < 5 || title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 5 and 100 characters'
      });
    }

    if (description.trim().length < 10 || description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 10 and 1000 characters'
      });
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 1 || budgetNum > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be between 1 and 1,000,000'
      });
    }

    // Create gig
    console.log('Creating gig with data:', { title, description, budget, ownerId: req.user._id });
    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id
    });

    console.log('Gig created successfully:', gig._id);

    // Populate owner details
    await gig.populate('owner', 'name email');

    console.log('Gig populated and ready to return');
    res.status(201).json({
      success: true,
      data: gig
    });
  } catch (error) {
    console.error('Create gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating gig'
    });
  }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private (Gig owner only)
const updateGig = async (req, res) => {
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

    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Make sure user owns the gig
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this gig'
      });
    }

    // Only allow updates for open gigs
    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update assigned gigs'
      });
    }

    const { title, description, budget } = req.body;

    gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { title, description, budget },
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email');

    res.status(200).json({
      success: true,
      data: gig
    });
  } catch (error) {
    console.error('Update gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating gig'
    });
  }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private (Gig owner only)
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Make sure user owns the gig
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this gig'
      });
    }

    // Only allow deletion for open gigs
    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assigned gigs'
      });
    }

    await Gig.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Gig deleted successfully'
    });
  } catch (error) {
    console.error('Delete gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting gig'
    });
  }
};

// @desc    Get user's gigs
// @route   GET /api/gigs/user/me
// @access  Private
const getUserGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      data: gigs
    });
  } catch (error) {
    console.error('Get user gigs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user gigs'
    });
  }
};

module.exports = {
  getGigs,
  getGig,
  createGig,
  updateGig,
  deleteGig,
  getUserGigs
};