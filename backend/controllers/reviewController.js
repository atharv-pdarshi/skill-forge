const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new review for a skill
const createReview = async (req, res) => {
  try {
    const { skillId } = req.params; 
    const { rating, comment } = req.body;
    const reviewerId = req.user.user_id; 

    if (rating === undefined || rating === null) { 
      return res.status(400).json({ message: "Rating is required." });
    }
    // Convert rating to number before validation if it's a string
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
    }

    // Check if the skill exists
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) {
        return res.status(404).json({ message: "Skill not found." });
    }

    // Prevent user from reviewing their own skill
    if (skill.userId === reviewerId) { 
        return res.status(403).json({ message: "You cannot review your own skill." });
    }

    const newReview = await prisma.review.create({
      data: {
        rating: numericRating, 
        comment,
        skillId: skillId,
        reviewerId: reviewerId,
      },
      include: { 
        reviewer: {
            select: { id: true, name: true, email: true } 
        }
      }
    });

    res.status(201).json(newReview);

  } catch (err) {
    // Handle unique constraint violation (user already reviewed this skill)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        
        if (err.meta && Array.isArray(err.meta.target) && err.meta.target.includes('skillId') && err.meta.target.includes('reviewerId')) {
            return res.status(409).json({ message: "You have already reviewed this skill." });
        }
        // If Prisma provides the constraint name directly in err.meta.target (as a string for named constraints)
        if (err.meta && typeof err.meta.target === 'string' && err.meta.target.includes('UniqueReviewPerUserPerSkill')) {
            return res.status(409).json({ message: "You have already reviewed this skill." });
        }
      }
    }
    // If it's not the specific P2002 for this unique constraint, or another Prisma error, or a generic error:
    console.error("Create review error:", err);
    res.status(500).json({ message: "Internal Server Error creating review.", error: err.message });
  }
};

// Get all reviews for a specific skill (publicly accessible)
const getReviewsForSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) {
        return res.status(404).json({ message: "Skill not found (when fetching reviews)." });
    }

    const reviews = await prisma.review.findMany({
      where: { skillId: skillId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
    }

    res.status(200).json({ reviews, averageRating, totalReviews: reviews.length });
  } catch (err) {
    console.error("Get reviews for skill error:", err);
    res.status(500).json({ message: "Internal Server Error fetching reviews." });
  }
};

module.exports = {
  createReview,
  getReviewsForSkill,
};