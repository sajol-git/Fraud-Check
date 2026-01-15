require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkFraud } = require('./backend/fraudController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/check-fraud', checkFraud);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});