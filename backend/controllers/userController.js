const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send('Email and password are required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).send('User Already Exists. Please Login');
    }

    // Encrypting user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Create a token for the new user
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.TOKEN_KEY,
      {
        expiresIn: '2h',
      }
    );

    // Return new user data (excluding password) and token
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: token,
    });

  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send('Something went wrong during registration');
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    // Getting user input
    const { email, password } = req.body;

    // Validating user input
    if (!(email && password)) {
      return res.status(400).send('Email and password are required');
    }

    // Validating if user exists in our database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // User exists and password matches
      // Create token
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.TOKEN_KEY,
        {
          expiresIn: '2h',
        }
      );

      // Return user data (excluding password) and token
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: token,
      });
    } else {
      // User not found or password doesn't match
      res.status(400).send('Invalid Credentials');
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send('Something went wrong during login');
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
    // req.user is populated by the auth middleware
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.user_id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Error fetching profile");
    }
};


module.exports = { registerUser, loginUser, getUserProfile };