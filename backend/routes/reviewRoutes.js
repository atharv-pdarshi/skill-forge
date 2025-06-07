const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authMiddleware =require('../middleware/auth'); 

// POST /api/skills/:skillId/reviews 
router.post('/', authMiddleware, reviewController.createReview);

// GET /api/skills/:skillId/reviews 
router.get('/', reviewController.getReviewsForSkill);


module.exports = router;