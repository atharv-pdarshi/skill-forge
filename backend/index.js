// backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Ensure .env variables are loaded early

// Import your route handlers
const userRoutes = require('./routes/userRoutes');   // Handles register, login, profile etc.
const skillRoutes = require('./routes/skillRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const aiRoutes = require('./routes/aiRoutes');     // Newly added AI routes

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable Express to parse JSON request bodies

// Simple root route to check if API is live
app.get('/', (req, res) => {
  res.send('Skill-Sharing Platform API is live! 🎉');
});

// Mount API Routes
app.use('/api/users', userRoutes);   // Handles /api/users/register, /api/users/login, /api/users/profile etc.
app.use('/api/skills', skillRoutes); // Handles /api/skills and nested /api/skills/:skillId/reviews
app.use('/api/bookings', bookingRoutes); // Handles /api/bookings
app.use('/api/ai', aiRoutes);       // Handles /api/ai/suggest-keywords

// Define the port
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});