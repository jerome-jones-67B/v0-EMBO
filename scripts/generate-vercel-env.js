#!/usr/bin/env node

/**
 * 🔧 Vercel Environment Variables Generator
 *
 * This script helps you generate the required environment variables
 * for your vercel.json file.
 *
 * Usage: node scripts/generate-vercel-env.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateEnvironmentVariables() {
  const nextAuthSecret = generateSecret(32);

  console.log('🔧 Generated Environment Variables for vercel.json');
  console.log('='.repeat(60));

  console.log('\n📋 Copy these values to your vercel.json file:');
  console.log('\n🔐 AUTHENTICATION:');
  console.log(`NEXTAUTH_SECRET: "${nextAuthSecret}"`);

  console.log('\n🌐 GOOGLE OAUTH (Optional):');
  console.log('GOOGLE_CLIENT_ID: "your-google-client-id.googleusercontent.com"');
  console.log('GOOGLE_CLIENT_SECRET: "your-google-client-secret"');
  console.log('GOOGLE_WORKSPACE_DOMAIN: "embo.org"');

  console.log('\n🔗 API TOKENS:');
  console.log('DATA4REV_AUTH_TOKEN: "your-data4rev-api-token"');
  console.log('NEXT_PUBLIC_AUTH_TOKEN: "your-public-auth-token-if-needed"');

  console.log('\n📝 NOTES:');
  console.log('• Update NEXTAUTH_URL to match your actual Vercel domain');
  console.log('• Replace Google OAuth values with real credentials from Google Cloud Console');
  console.log('• Replace API tokens with your actual tokens');
  console.log('• Set BYPASS_AUTH: "true" for demo mode, "false" for production');
  console.log('• Set NEXT_PUBLIC_USE_MOCK_DATA: "true" for demo, "false" for live API');

  console.log('\n🚀 Deploy Steps:');
  console.log('1. Update the values in vercel.json');
  console.log('2. git add . && git commit -m "Configure environment variables"');
  console.log('3. git push');
  console.log('4. Vercel will automatically redeploy with new configuration');

  console.log('\n✅ Done! Your secrets are ready.');
}

// Run the generator
generateEnvironmentVariables();
