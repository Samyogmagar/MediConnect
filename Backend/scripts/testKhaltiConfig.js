#!/usr/bin/env node

/**
 * Khalti Configuration Test Script
 * Run: node scripts/testKhaltiConfig.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const env = {
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY,
  KHALTI_API_BASE_URL: process.env.KHALTI_API_BASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
};

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║         Khalti Configuration Test                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
console.log(`   ✓ KHALTI_SECRET_KEY: ${env.KHALTI_SECRET_KEY ? '***' + env.KHALTI_SECRET_KEY.slice(-4) : '❌ MISSING'}`);
console.log(`   ✓ KHALTI_API_BASE_URL: ${env.KHALTI_API_BASE_URL || '❌ MISSING'}`);
console.log(`   ✓ FRONTEND_URL: ${env.FRONTEND_URL || '❌ MISSING'}\n`);

// Validate format
if (!env.KHALTI_SECRET_KEY) {
  console.error('❌ ERROR: KHALTI_SECRET_KEY is not configured');
  console.error('   Please add it to Backend/.env\n');
  process.exit(1);
}

if (!env.KHALTI_API_BASE_URL) {
  console.error('❌ ERROR: KHALTI_API_BASE_URL is not configured');
  console.error('   Default: https://dev.khalti.com/api/v2\n');
  process.exit(1);
}

// Test API connectivity
console.log('2. Testing Khalti API Connectivity:\n');

const testPaymentInitiation = async () => {
  try {
    console.log(`   Calling: ${env.KHALTI_API_BASE_URL}/epayment/initiate/`);

    const response = await axios.post(
      `${env.KHALTI_API_BASE_URL}/epayment/initiate/`,
      {
        return_url: `${env.FRONTEND_URL}/patient/book-appointment/test-doctor-id`,
        website_url: env.FRONTEND_URL,
        amount: 50000, // 500 NPR in paisa
        purchase_order_id: `TEST-${Date.now()}`,
        purchase_order_name: 'Test Payment',
        customer_info: {
          name: 'Test User',
          email: 'test@mediconnect.local',
        },
      },
      {
        headers: {
          Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    console.log('   ✓ Connection successful!\n');
    console.log('   Response:');
    console.log(`     - pidx: ${response.data.pidx}`);
    console.log(`     - payment_url: ${response.data.payment_url}`);
    console.log(`     - expires_in: ${response.data.expires_in}s\n`);

    console.log('   ✅ Khalti API is working correctly!\n');
    return true;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    console.log(`   ❌ Connection failed!\n`);
    console.log(`   Status: ${status || error.code}`);
    console.log(`   Message: ${data?.detail || data?.message || error.message}\n`);

    if (status === 401 || status === 403) {
      console.error('   ⚠️  AUTHENTICATION ERROR');
      console.error('   Your KHALTI_SECRET_KEY might be invalid.');
      console.error('   Please verify:\n');
      console.error('   1. Go to https://dashboard.khalti.com/settings/merchant');
      console.error('   2. Copy the Secret Key exactly (without extra spaces)');
      console.error('   3. Update Backend/.env and restart the server\n');
    } else if (status === 400) {
      console.error('   ⚠️  VALIDATION ERROR');
      console.error('   The payment details might be invalid.\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  NETWORK ERROR');
      console.error('   Cannot reach Khalti API.');
      console.error('   Check your internet connection or Khalti API URL.\n');
    }

    return false;
  }
};

(async () => {
  const isValid = await testPaymentInitiation();

  console.log('3. Configuration Summary:\n');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Base URL: ${env.KHALTI_API_BASE_URL}`);
  console.log(`   Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`   Status: ${isValid ? '✅ READY' : '❌ NEED SETUP'}\n`);

  if (!isValid) {
    console.log('Next Steps:');
    console.log('1. Update Backend/.env with correct Khalti credentials');
    console.log('2. Restart the backend: npm run dev');
    console.log('3. Run this test again: node scripts/testKhaltiConfig.js\n');
    process.exit(1);
  } else {
    console.log('You can now test the full payment flow in the app!\n');
    process.exit(0);
  }
})();
