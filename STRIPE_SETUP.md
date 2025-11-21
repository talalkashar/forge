# Stripe Checkout Setup Instructions

## 📋 Overview
This guide will help you set up Stripe checkout for your FORGE website. The setup includes a secure backend server and frontend integration.

## 🔑 Step 1: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_`)
4. Copy your **Secret key** (starts with `sk_`)
5. Create a **Price ID** for your product:
   - Go to **Products** → Create or select your product
   - Create a price for the product
   - Copy the **Price ID** (starts with `price_`)

## 🔧 Step 2: Configure Backend (.env file)

1. Navigate to the `server` folder
2. Create a file named `.env` (if it doesn't exist)
3. Add the following content:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
PRICE_ID=price_your_price_id_here
```

**Important Notes:**
- Replace the placeholder values with your actual Stripe keys
- Use `sk_test_` and `pk_test_` for testing
- Use `sk_live_` and `pk_live_` for production
- The `.env` file is already in `.gitignore` and will NOT be committed to git

## 🌐 Step 3: Configure Frontend (config.js)

1. Open `config.js` in the root directory
2. Add your Stripe **PUBLIC KEY** (never the secret key!):

```javascript
window.STRIPE_PUBLIC_KEY = 'pk_test_your_public_key_here';
```

**Security Note:** Only the PUBLIC key goes in `config.js`. The secret key stays in the backend `.env` file only.

## 🚀 Step 4: Install Dependencies

1. Navigate to the `server` folder:
   ```bash
   cd server
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## ▶️ Step 5: Start the Server

1. Start the backend server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. The server should start on `http://localhost:5000`

## 🌍 Step 6: Update Production URLs

Before deploying to production:

1. **Update `server/routes/checkout.js`:**
   - Change `success_url` and `cancel_url` to your production domain
   - Currently set to: `https://capacitygears.com/success` and `https://capacitygears.com/cancel`

2. **Update `src/js/checkout.js`:**
   - Replace `'https://your-server-domain.com/api'` with your actual production server URL
   - This is on line 73 of `checkout.js`

## ✅ Step 7: Test the Integration

1. Open `product.html` in your browser
2. Click the **"Buy Now"** button
3. You should be redirected to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete the test payment

## 📁 File Structure

```
forge/
├── server/
│   ├── .env                    ← Add your Stripe keys here
│   ├── server.js               ← Express server
│   ├── package.json            ← Dependencies
│   └── routes/
│       └── checkout.js         ← Stripe checkout route
├── src/
│   └── js/
│       └── checkout.js         ← Frontend checkout handler
├── config.js                   ← Add your PUBLIC key here
├── product.html                ← Product page with Buy Now button
├── success.html                ← Success page
├── cancel.html                 ← Cancel page
└── .gitignore                  ← Protects .env from being committed
```

## 🔒 Security Checklist

- ✅ Secret key is ONLY in `server/.env` (never in frontend)
- ✅ Public key is in `config.js` (safe to expose)
- ✅ `.env` is in `.gitignore` (won't be committed)
- ✅ Backend validates all requests
- ✅ CORS is configured for security

## 🐛 Troubleshooting

**Server won't start:**
- Make sure you've installed dependencies: `npm install`
- Check that port 5000 is not in use
- Verify your `.env` file exists and has all three variables

**Checkout button doesn't work:**
- Open browser console (F12) to see error messages
- Verify the server is running on port 5000
- Check that `config.js` has your public key set
- Make sure the API URL in `checkout.js` matches your server

**"Stripe secret key not configured" error:**
- Verify your `.env` file is in the `server` folder
- Check that `STRIPE_SECRET_KEY=` has a value (no spaces around the `=`)
- Restart the server after editing `.env`

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server console for backend errors
3. Verify all keys are correctly set in both `.env` and `config.js`
4. Ensure the server is running and accessible

---

**Remember:** Never commit your `.env` file or secret keys to git!

