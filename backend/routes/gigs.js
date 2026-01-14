const express = require('express');
const { body, param } = require('express-validator');
const {
  getGigs,
  getGig,
  createGig,
  updateGig,
  deleteGig,
  getUserGigs
} = require('../controllers/gigController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const gigValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('budget')
    .isNumeric()
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Budget must be between 1 and 1,000,000')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid gig ID')
];

// Public routes
router.get('/', getGigs);
router.get('/:id', idValidation, getGig);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/user/me', getUserGigs);
router.post('/', createGig);
router.put('/:id', idValidation, updateGig);
router.delete('/:id', idValidation, deleteGig);

module.exports = router;