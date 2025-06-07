const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth'); 

router.post('/suggest-keywords', authMiddleware, aiController.suggestSkillKeywords);

module.exports = router;