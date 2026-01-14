const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [1, 'Budget must be at least 1'],
    max: [1000000, 'Budget cannot exceed 1,000,000']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  status: {
    type: String,
    enum: ['open', 'assigned'],
    default: 'open'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
gigSchema.index({ ownerId: 1 });
gigSchema.index({ status: 1 });
gigSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual for bid count
gigSchema.virtual('bidCount', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'gigId',
  count: true
});

// Virtual for owner details
gigSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Gig', gigSchema);