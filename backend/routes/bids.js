const express = require('express');
const { body, param } = require('express-validator');
const {
  getBidsForGig,
  createBid,
  hireFreelancer,
  getUserBids
} = require('../controllers/bidController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const bidValidation = [
  body('gigId')
    .isMongoId()
    .withMessage('Invalid gig ID'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  body('price')
    .isNumeric()
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Price must be between 1 and 1,000,000')
];

const gigIdValidation = [
  param('gigId')
    .isMongoId()
    .withMessage('Invalid gig ID')
];

const bidIdValidation = [
  param('bidId')
    .isMongoId()
    .withMessage('Invalid bid ID')
];

// All routes require authentication
router.use(protect);

router.get('/user/me', getUserBids);
router.get('/:gigId', gigIdValidation, getBidsForGig);
router.post('/', bidValidation, createBid);
router.patch('/:bidId/hire', bidIdValidation, hireFreelancer);

module.exports = router;