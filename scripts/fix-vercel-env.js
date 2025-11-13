#!/usr/bin/env node

/**
 * 🔧 Fix Vercel Environment Variables for EMBO App
 *
 * This script helps you properly set up environment variables in Vercel
 * for the EMBO manuscript management system.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

function displayCorrectEnvVars() {
  log('cyan', '🔧 CORRECT Vercel Environment Variable Setup');
  log('yellow', '=' .repeat(60));

  log('red', '\n❌ WRONG: Your current concatenated variable');
  log('bright', 'NEXT_PUBLIC_DATA4REV_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE3NTc1MjAyOTksImV4cCI6MTc4ODYyNDI5OSwiYXVkIjoiZGF0YTRyZXYiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.z8-At4lk5g1z1PqFxvGCDJfKr4qoUgM0GWMqxmebZpoNEXT_PUBLIC_DATA4REV_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/apiNEXT_PUBLIC_USE_MOCK_DATA=false');

  log('green', '\n✅ CORRECT: Three separate variables');

  const envVars = [
    {
      name: 'NEXT_PUBLIC_DATA4REV_AUTH_TOKEN',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE3NTc1MjAyOTksImV4cCI6MTc4ODYyNDI5OSwiYXVkIjoiZGF0YTRyZXYiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.z8-At4lk5g1z1PqFxvGCDJfKr4qoUgM0GWMqxmebZpo',
      description: 'Authentication token for Data4Rev API'
    },
    {
      name: 'NEXT_PUBLIC_DATA4REV_API_BASE_URL',
      value: 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api',
      description: 'Base URL for Data4Rev API'
    },
    {
      name: 'NEXT_PUBLIC_USE_MOCK_DATA',
      value: 'false',
      description: 'Whether to use mock data (set to false for real API)'
    }
  ];

  envVars.forEach((env, index) => {
    log('yellow', `\n${index + 1}. ${env.description}`);
    log('bright', `   Variable Name: ${env.name}`);
    log('bright', `   Value: ${env.value}`);
  });

  log('cyan', '\n📋 Steps to Fix in Vercel Dashboard:');
  log('yellow', '1. Go to: https://vercel.com/dashboard');
  log('yellow', '2. Select your project: v0-embo');
  log('yellow', '3. Go to Settings → Environment Variables');
  log('yellow', '4. DELETE the incorrectly concatenated variable');
  log('yellow', '5. ADD these three separate variables:');

  envVars.forEach((env, index) => {
    log('green', `\n   ${index + 1}. Add Variable:`);
    log('bright', `      Name: ${env.name}`);
    log('bright', `      Value: ${env.value}`);
    log('bright', `      Environment: Production`);
  });

  log('yellow', '\n6. Redeploy your application');
  log('yellow', '7. Check browser console for debug logs');

  log('cyan', '\n🔍 How to Verify:');
  log('green', '• Open your deployed app');
  log('green', '• Open browser developer tools (F12)');
  log('green', '• Look for "🔧 Debug - Environment check" logs');
  log('green', '• Verify hasToken: true and tokenLength: 135');
  log('green', '• Check network tab for Authorization header in API requests');

  log('cyan', '\n🚀 Alternative: Use Vercel CLI');
  log('yellow', 'If you prefer command line:');

  envVars.forEach((env) => {
    log('bright', `vercel env add ${env.name} production`);
    log('green', `# When prompted, enter: ${env.value}`);
  });

  log('bright', '\nvercel --prod  # Redeploy');
}

function main() {
  log('bright', '🚀 EMBO Manuscript Management - Environment Variable Fixer\n');
  displayCorrectEnvVars();

  log('red', '\n⚠️  Important Notes:');
  log('red', '• Environment variables are embedded at BUILD TIME for static exports');
  log('red', '• You MUST redeploy after changing environment variables');
  log('red', '• Check browser console logs to verify the fix worked');

  log('green', '\n💡 After fixing, you should see:');
  log('green', '• Authorization header in network requests');
  log('green', '• Successful API responses (not 403 errors)');
  log('green', '• Debug logs showing hasToken: true');
}

main();
