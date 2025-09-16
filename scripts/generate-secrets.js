#!/usr/bin/env node

/**
 * Generate Secrets for Vercel Deployment
 * Run: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 EMBO App - Vercel Deployment Secrets Generator\n');

// Generate NEXTAUTH_SECRET
const nextAuthSecret = crypto.randomBytes(32).toString('base64');
console.log('✅ Generated NEXTAUTH_SECRET:');
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}\n`);

// Generate a sample configuration
console.log('📋 Complete Environment Variables for Vercel:');
console.log('='.repeat(50));
console.log(`
# 🔐 Authentication (Required)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=${nextAuthSecret}

# 🌐 Google OAuth (Optional - Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_WORKSPACE_DOMAIN=yourdomain.com

# 🔗 API Configuration (Required)
NEXT_PUBLIC_API_BASE_URL=https://your-app-name.vercel.app/api
DATA4REV_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api
DATA4REV_AUTH_TOKEN=your-data4rev-api-token

# ⚙️ App Configuration
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_REALTIME=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
NODE_ENV=production

# 🛠️ Development Bypass (Set to false for production)
BYPASS_AUTH=false
`);

console.log('='.repeat(50));
console.log('\n📝 Next Steps:');
console.log('1. Copy the environment variables above');
console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('3. Add each variable for the "Production" environment');
console.log('4. Replace placeholder values with your actual credentials');
console.log('5. Redeploy your app\n');

console.log('🎯 For Demo Deployment (Faster Setup):');
console.log('Set NEXT_PUBLIC_USE_MOCK_DATA=true and BYPASS_AUTH=true');
console.log('This allows immediate access without external API setup\n');

console.log('🔗 Useful Links:');
console.log('- Google OAuth Setup: https://console.cloud.google.com/');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- NextAuth.js Docs: https://next-auth.js.org/');
