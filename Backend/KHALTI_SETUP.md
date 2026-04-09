# Khalti Payment Integration Setup Guide

## Overview
This guide helps you set up and debug the Khalti payment integration in MediConnect.

## Prerequisites
1. Khalti merchant account (register at https://khalti.com)
2. Test/Development API credentials
3. Backend running on http://localhost:5000
4. Frontend running on http://localhost:5173

## Setup Steps

### 1. Get Your Khalti Credentials

1. Go to https://dashboard.khalti.com (or https://dev.khalti.com for testing)
2. Sign in to your merchant account
3. Navigate to Settings → Merchant → API Credentials
4. Copy your:
   - **Secret Key** (keep this confidential)
   - **Public Key** (can be public)

### 2. Configure Backend Environment

Update `/Backend/.env`:

```env
# Khalti Configuration
KHALTI_SECRET_KEY=your-secret-key-from-dashboard
KHALTI_PUBLIC_KEY=your-public-key-from-dashboard
KHALTI_API_BASE_URL=https://dev.khalti.com/api/v2

# Frontend URL (for Khalti to redirect back)
FRONTEND_URL=http://localhost:5173
```

### 3. Verify Configuration

Run this to test if your credentials work:

```bash
cd Backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                    MediConnect API                     ║
╠═══════════════════════════════════════════════════════╣
║  Status:      Running                                  ║
║  Environment: development                              ║
║  Port:        5000                                     ║
║  URL:         http://localhost:5000                   ║
╚═══════════════════════════════════════════════════════╝
```

## Testing the Payment Flow

### Step 1: Create Test Appointment Form

1. Start Frontend: `npm run dev` (in Frontend directory)
2. Log in as a Patient
3. Go to "Book Appointment"
4. Select a doctor, date, and time
5. Fill in the reason
6. Select "Online Payment (Khalti)" as payment method

### Step 2: Click "Pay Now with Khalti"

When you click the button:
1. Frontend calls `/api/appointments/payments/khalti/initiate`
2. Backend validates your booking details
3. Backend calls Khalti API to initiate payment
4. Khalti returns a `pidx` (Payment Index) and `payment_url`
5. Frontend redirects to Khalti payment page

### Step 3: Complete Khalti Payment

On the Khalti payment page:
- Use test credentials (if you're on dev.khalti.com)
- Complete the payment
- Khalti redirects back to your app

### Step 4: Verify Payment

The app auto-finalizes the appointment after payment.

## Troubleshooting

### Issue: "Khalti payment service is temporarily unavailable"
**Cause:** Khalti API is down or unreachable
**Solution:**
1. Check your internet connection
2. Verify KHALTI_API_BASE_URL is correct
3. Try switching between `https://dev.khalti.com` (test) and production URLs

### Issue: "Khalti authentication failed"
**Cause:** Invalid API credentials
**Solution:**
1. Verify KHALTI_SECRET_KEY in .env
2. Copy the exact key from dashboard (no extra spaces)
3. Restart the backend after changing .env

### Issue: Payment initiated but no redirect to Khalti
**Cause:** Missing or invalid response from Khalti
**Solution:**
1. Check backend logs: `npm run dev` output
2. Look for error messages starting with `[Khalti Initiate]`
3. Verify your credentials are valid for the test environment

### Issue: Payment completes but appointment not created
**Cause:** Verification failed or draft data missing
**Solution:**
1. Browser must have localStorage enabled
2. Don't clear browser data during payment
3. Check backend logs for verification errors

## Backend Logs to Check

When running `npm run dev`, look for these log messages:

```
Initiating Khalti payment...
--> [Khalti Initiate] Error status: 401
--> [Khalti Initiate] Error data: {"detail":"Invalid credentials"}
--> [Khalti Initiate] Request details: {amount: 50000, ...}
```

## Test Payment Details (for dev.khalti.com)

Use these test credentials on Khalti payment page:
- **Phone Number:** 9800000000-9899999999
- **OTP:** 123456
- **MPIN:** 1234 (if required)

Check Khalti documentation for latest test credentials.

## Production Setup

When moving to production:

1. Update `.env`:
```env
NODE_ENV=production
KHALTI_SECRET_KEY=your-production-secret-key
KHALTI_API_BASE_URL=https://khalti.com/api/v2
FRONTEND_URL=https://yourdomain.com
APP_URL=https://api.yourdomain.com
```

2. Ensure HTTPS is enabled
3. Verify return URLs are correct
4. Test with real Khalti account credentials

## API Endpoint Reference

### Initiate Payment
- **URL:** `POST /api/appointments/payments/khalti/initiate`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "doctorId": "mongodb-id",
  "dateTime": "2024-03-26T10:00:00Z",
  "reason": "Checkup",
  "paymentAmount": 500
}
```

- **Response:**
```json
{
  "data": {
    "payment": {
      "pidx": "abc123xyz",
      "paymentUrl": "https://khalti.com/pay/abc123xyz",
      "expiresAt": "2024-03-26T10:30:00Z"
    }
  }
}
```

### Create Appointment
- **URL:** `POST /api/appointments`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "doctorId": "mongodb-id",
  "dateTime": "2024-03-26T10:00:00Z",
  "reason": "Checkup",
  "notes": "Optional notes",
  "paymentMethod": "khalti",
  "paymentAmount": 500,
  "khaltiPidx": "abc123xyz"
}
```

## Contact Support

For Khalti-specific issues:
- Khalti Documentation: https://khalti.com/developers
- Email: developer@khalti.com
