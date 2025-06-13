const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new Skill
const createSkill = async (req, res) => {
  try {
    const { title, description, category, pricePerHour } = req.body;
    const userId = req.user.user_id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newSkill = await prisma.skill.create({
      data: {
        title,
        description,
        category,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
        userId: userId, 
      },
    });
    res.status(201).json(newSkill);
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ message: 'Failed to create skill', error: error.message });
  }
};

// Get all Skills
const getAllSkills = async (req, res) => {
  
  try {
    const { 
        search, 
        category, 
        minPrice, 
        maxPrice, 
        userId, 
        sortBy, 
        sortOrder, 
        limit // Added limit
    } = req.query;

    const whereClause = {};

    // 1. Keyword Search
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 2. Category Filter
    if (category) { // Using the destructured 'category'
      whereClause.category = { equals: category.trim(), mode: 'insensitive' };
    }

    // 3. Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.pricePerHour = {};
        if (minPrice !== undefined && !isNaN(parseFloat(minPrice))) {
            whereClause.pricePerHour.gte = parseFloat(minPrice);
        }
        if (maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) {
            whereClause.pricePerHour.lte = parseFloat(maxPrice);
        }
        
        if (Object.keys(whereClause.pricePerHour).length === 0) {
            delete whereClause.pricePerHour;
        }
    }


    // 4. User ID Filter
    if (userId) {
        whereClause.userId = userId;
    }
    
    // 5. Sorting
    let orderByClause = {};
    if (sortBy) {
      if (['title', 'pricePerHour', 'createdAt'].includes(sortBy)) {
        orderByClause[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
      } else {
        orderByClause.createdAt = 'desc'; // Default to newest if sortBy is invalid
      }
    } else {
      orderByClause.createdAt = 'desc'; // Default sort
    }

    // Prepare query options for Prisma
    const queryOptions = {
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true } 
          }
        },
        orderBy: orderByClause
    };

    if (limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0) {
        queryOptions.take = parseInt(limit); 
    }

    const skills = await prisma.skill.findMany(queryOptions);

    res.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Failed to fetch skills', error: error.message });
  }
};

// Get a single Skill by ID
const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await prisma.skill.findUnique({
      where: { id: id },
      include: {
        user: { 
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.status(200).json(skill);
  } catch (error) {
    console.error('Error fetching skill by ID:', error);
    res.status(500).json({ message: 'Failed to fetch skill', error: error.message });
  }
};

// Update a Skill by ID
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, pricePerHour } = req.body;
    const userId = req.user.user_id;

    const skill = await prisma.skill.findUnique({
      where: { id: id },
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own skills' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    // Use req.body.category directly to allow setting it to an empty string if desired
    if (req.body.hasOwnProperty('category')) updateData.category = req.body.category; 
    if (req.body.hasOwnProperty('pricePerHour')) {
        updateData.pricePerHour = req.body.pricePerHour !== null && req.body.pricePerHour !== '' ? parseFloat(req.body.pricePerHour) : null;
    }


    const updatedSkill = await prisma.skill.update({
      where: { id: id },
      data: updateData,
    });
    res.status(200).json(updatedSkill);
  } catch (error) {
    console.error('Error updating skill:', error);
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Skill not found or you do not have permission to update' });
    }
    res.status(500).json({ message: 'Failed to update skill', error: error.message });
  }
};

// Delete a Skill by ID
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const skill = await prisma.skill.findUnique({
      where: { id: id },
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own skills' });
    }

    await prisma.skill.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting skill:', error);
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Skill not found or you do not have permission to delete' });
    }
    res.status(500).json({ message: 'Failed to delete skill', error: error.message });
  }
};

module.exports = {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
};