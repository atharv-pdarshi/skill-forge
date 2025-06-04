const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Skill-Sharing Platform API is live! 🎉');
});

app.use('/api/users', userRoutes);

app.use('/api/skills', skillRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});