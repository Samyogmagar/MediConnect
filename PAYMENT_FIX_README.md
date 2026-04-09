# Khalti Payment Fix - Quick Checklist

## ✅ Changes Made to Fix Payment Integration

### 1. Backend Updates
- ✅ Updated `.env.example` with Khalti configuration template
- ✅ Added `paymentAmount` parameter validation in controller
- ✅ Added amount verification in service (frontend amount must match doctor's fee)
- ✅ Enhanced error logging for debugging Khalti API issues
- ✅ Improved error messages for different failure scenarios

### 2. New Debugging Tools
- ✅ Created `KHALTI_SETUP.md` - Complete setup and troubleshooting guide
- ✅ Created `scripts/testKhaltiConfig.js` - Tool to verify your Khalti setup

## 🚀 Quick Start to Fix Your Payment

### Step 1: Verify Your Khalti Credentials
1. Log in to https://dashboard.khalti.com
2. Go to Settings → Merchant → API Credentials
3. Copy your **Secret Key** and **Public Key**

### Step 2: Update Backend Configuration
Edit `Backend/.env`:
```env
KHALTI_SECRET_KEY=your-secret-key-from-dashboard
KHALTI_PUBLIC_KEY=your-public-key-from-dashboard
KHALTI_API_BASE_URL=https://dev.khalti.com/api/v2
FRONTEND_URL=http://localhost:5173
```

### Step 3: Test Your Configuration
```bash
cd Backend
node scripts/testKhaltiConfig.js
```

You should see: `✅ Khalti API is working correctly!`

### Step 4: Restart Backend
```bash
npm run dev
```

### Step 5: Test Payment Flow
1. Start Frontend: `npm run dev`
2. Log in as Patient
3. Book appointment with "Online Payment (Khalti)"
4. Click "Pay Now with Khalti"
5. You should be redirected to Khalti payment page

## 🔍 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Khalti authentication failed" | Invalid secret key | Check and update `KHALTI_SECRET_KEY` in `.env` |
| "Khalti payment service unavailable" | API down or unreachable | Check internet connection, verify `KHALTI_API_BASE_URL` |
| "Invalid payment amount" | Amount mismatch | Doctor's fee must match payment amount |
| No redirect to Khalti | API connection failed | Run `node scripts/testKhaltiConfig.js` |
| Payment succeeds but appointment fails | Return URL issue | Ensure `FRONTEND_URL=http://localhost:5173` |

## 📝 What Was Fixed

1. **Frontend Amount Validation** - Backend now validates that frontend's submitted amount matches doctor's actual consultation fee
2. **Better Error Logs** - More detailed logging to help identify API issues
3. **Configuration Template** - `.env.example` now includes Khalti configuration
4. **Test Tool** - Can now verify Khalti setup before testing full flow
5. **Setup Guide** - Comprehensive `KHALTI_SETUP.md` for troubleshooting

## 📱 Testing Payment (Dev Environment)

After setup, Khalti will provide test credentials:
- **Phone:** 9800000000 - 9899999999
- **OTP:** 123456

## ✨ Next Steps

1. Update your `.env` file with real Khalti credentials
2. Run the test script
3. Restart backend
4. Test the payment flow in your app

If payment still doesn't work:
1. Check backend logs for `[Khalti Initiate]` messages
2. Run `node scripts/testKhaltiConfig.js` for diagnosis
3. Read `KHALTI_SETUP.md` for detailed troubleshooting
