const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middleware/auth');

// For creating a new skill (Protected)
router.post('/', authMiddleware, skillController.createSkill);

// For getting all skills (Public)
router.get('/', skillController.getAllSkills);

// For getting a single skill by ID (Public)
router.get('/:id', skillController.getSkillById);

// For updating a skill by ID (Protected)
router.put('/:id', authMiddleware, skillController.updateSkill);

// For deleting a skill by ID (Protected)
router.delete('/:id', authMiddleware, skillController.deleteSkill);

module.exports = router;