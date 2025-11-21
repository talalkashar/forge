// Stripe Checkout Route
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { quantity } = req.body;

    // Validate quantity
    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    if (!process.env.PRICE_ID) {
      return res.status(500).json({ error: 'Stripe price ID not configured' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.PRICE_ID,
          quantity: qty,
        },
      ],
      success_url: 'https://capacitygears.com/success',
      cancel_url: 'https://capacitygears.com/cancel',
    });

    // Return session URL
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

module.exports = router;

