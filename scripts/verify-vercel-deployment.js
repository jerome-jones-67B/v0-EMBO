#!/usr/bin/env node

/**
 * 🔍 Vercel Deployment Verification Script
 * 
 * This script helps you verify that your Vercel environment variables
 * are set correctly and provides step-by-step troubleshooting.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

function main() {
  log('cyan', '🔍 Vercel Deployment Verification Guide');
  log('yellow', '=' .repeat(50));
  
  log('red', '\n❌ PROBLEM: Environment variables are undefined in production');
  
  log('yellow', '\n📋 STEP-BY-STEP VERIFICATION:');
  
  log('bright', '\n1. Check your deployed app:');
  log('green', '   • Open your deployed URL in browser');
  log('green', '   • Look for a black debug box in bottom-right corner');
  log('green', '   • Check if all environment variables show as "undefined"');
  
  log('bright', '\n2. Verify Vercel Dashboard Settings:');
  log('green', '   • Go to: https://vercel.com/dashboard');
  log('green', '   • Select project: v0-embo');
  log('green', '   • Go to: Settings → Environment Variables');
  log('green', '   • Check you have exactly these 3 variables:');
  
  const envVars = [
    'NEXT_PUBLIC_DATA4REV_AUTH_TOKEN',
    'NEXT_PUBLIC_DATA4REV_API_BASE_URL', 
    'NEXT_PUBLIC_USE_MOCK_DATA'
  ];
  
  envVars.forEach((varName, index) => {
    log('cyan', `     ${index + 1}. ${varName}`);
  });
  
  log('bright', '\n3. Common Issues & Solutions:');
  
  log('red', '\n   Issue A: Variables are still concatenated');
  log('yellow', '   Solution: Delete the old concatenated variable first');
  log('green', '   • Look for a variable with a very long value');
  log('green', '   • Delete it completely');
  log('green', '   • Add the 3 separate variables');
  
  log('red', '\n   Issue B: Wrong environment scope');
  log('yellow', '   Solution: Set variables for "Production" environment');
  log('green', '   • When adding each variable, select "Production"');
  log('green', '   • Do NOT use "Preview" or "Development"');
  
  log('red', '\n   Issue C: App not redeployed');
  log('yellow', '   Solution: Force a redeploy');
  log('green', '   • Go to Deployments tab in Vercel');
  log('green', '   • Click "Redeploy" on latest deployment');
  log('green', '   • OR push a new commit to trigger rebuild');
  
  log('bright', '\n4. Correct Variable Values:');
  
  log('cyan', '\n   NEXT_PUBLIC_DATA4REV_AUTH_TOKEN:');
  log('bright', '   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE3NTc1MjAyOTksImV4cCI6MTc4ODYyNDI5OSwiYXVkIjoiZGF0YTRyZXYiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.z8-At4lk5g1z1PqFxvGCDJfKr4qoUgM0GWMqxmebZpo');
  
  log('cyan', '\n   NEXT_PUBLIC_DATA4REV_API_BASE_URL:');
  log('bright', '   https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api');
  
  log('cyan', '\n   NEXT_PUBLIC_USE_MOCK_DATA:');
  log('bright', '   false');
  
  log('bright', '\n5. Alternative: Use Vercel CLI');
  log('yellow', '   If dashboard method fails, try CLI:');
  
  log('green', '\n   # Install Vercel CLI');
  log('bright', '   npm i -g vercel');
  log('bright', '   vercel login');
  
  log('green', '\n   # Remove existing variables (if any)');
  log('bright', '   vercel env rm NEXT_PUBLIC_DATA4REV_AUTH_TOKEN production');
  log('bright', '   vercel env rm NEXT_PUBLIC_DATA4REV_API_BASE_URL production');
  log('bright', '   vercel env rm NEXT_PUBLIC_USE_MOCK_DATA production');
  
  log('green', '\n   # Add correct variables');
  log('bright', '   vercel env add NEXT_PUBLIC_DATA4REV_AUTH_TOKEN production');
  log('yellow', '   # Paste the auth token when prompted');
  
  log('bright', '   vercel env add NEXT_PUBLIC_DATA4REV_API_BASE_URL production');
  log('yellow', '   # Paste the API URL when prompted');
  
  log('bright', '   vercel env add NEXT_PUBLIC_USE_MOCK_DATA production');
  log('yellow', '   # Enter: false');
  
  log('green', '\n   # Redeploy');
  log('bright', '   vercel --prod');
  
  log('bright', '\n6. Verification Steps:');
  log('green', '   • After redeployment, check the debug box again');
  log('green', '   • All variables should show actual values (not "undefined")');
  log('green', '   • Auth token should show "✅ Token Present"');
  log('green', '   • API calls should include Authorization header');
  log('green', '   • Should get 200 responses instead of 403');
  
  log('red', '\n⚠️  IMPORTANT:');
  log('red', '   • Environment variables are baked into the build for static exports');
  log('red', '   • You MUST redeploy after changing environment variables');
  log('red', '   • Check the debug box after every change');
  
  log('cyan', '\n💡 Once working, remove the debug component from layout.tsx');
}

main();
