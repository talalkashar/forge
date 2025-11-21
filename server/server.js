// FORGE Stripe Checkout Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const checkoutRoutes = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', checkoutRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FORGE Stripe server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FORGE Stripe server running on port ${PORT}`);
  console.log(`📝 Make sure to fill in your Stripe keys in .env file`);
});

