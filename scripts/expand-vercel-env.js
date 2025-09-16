#!/usr/bin/env node

/**
 * 🔧 Vercel Environment Variables - Full Configuration
 * 
 * This script shows the complete environment configuration
 * for production deployments when you need more than the demo setup.
 * 
 * Usage: node scripts/expand-vercel-env.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function showFullConfiguration() {
  const nextAuthSecret = generateSecret(32);
  
  console.log('🔧 Full Production Environment Variables for vercel.json');
  console.log('='.repeat(70));
  
  console.log('\n📋 Replace the minimal vercel.json "env" section with this for production:');
  console.log('\n```json');
  console.log('"env": {');
  console.log('  "_comment": "🚀 Full Production Configuration",');
  console.log('  ');
  console.log('  "NODE_ENV": "production",');
  console.log('  ');
  console.log('  "_comment_auth": "🔐 Authentication",');
  console.log('  "NEXTAUTH_URL": "https://your-actual-domain.vercel.app",');
  console.log(`  "NEXTAUTH_SECRET": "${nextAuthSecret}",`);
  console.log('  "BYPASS_AUTH": "false",');
  console.log('  ');
  console.log('  "_comment_google": "🌐 Google OAuth (Optional)",');
  console.log('  "GOOGLE_CLIENT_ID": "your-google-client-id.googleusercontent.com",');
  console.log('  "GOOGLE_CLIENT_SECRET": "your-google-client-secret",');
  console.log('  "GOOGLE_WORKSPACE_DOMAIN": "embo.org",');
  console.log('  ');
  console.log('  "_comment_api": "🔗 API Configuration",');
  console.log('  "NEXT_PUBLIC_API_BASE_URL": "/api",');
  console.log('  "DATA4REV_API_BASE_URL": "https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api",');
  console.log('  "DATA4REV_AUTH_TOKEN": "your-real-data4rev-token",');
  console.log('  ');
  console.log('  "_comment_app": "⚙️ App Settings",');
  console.log('  "NEXT_PUBLIC_API_TIMEOUT": "10000",');
  console.log('  "NEXT_PUBLIC_API_RETRIES": "3",');
  console.log('  "NEXT_PUBLIC_USE_MOCK_DATA": "false",');
  console.log('  "NEXT_PUBLIC_ENABLE_REALTIME": "false",');
  console.log('  "NEXT_PUBLIC_ENABLE_ANALYTICS": "true",');
  console.log('  "NEXT_PUBLIC_MAX_FILE_SIZE": "52428800"');
  console.log('}');
  console.log('```');
  
  console.log('\n📝 What each does:');
  console.log('✅ Current minimal config works for: Demo, Mock Data, Basic Auth');
  console.log('🔗 Add API tokens when: Using real Data4Rev API');
  console.log('🌐 Add Google OAuth when: Using Google Sign-In');
  console.log('⚙️ Add app settings when: Need custom timeouts/limits');
  
  console.log('\n🎯 Demo vs Production:');
  console.log('DEMO:        NEXT_PUBLIC_USE_MOCK_DATA: "true"');
  console.log('PRODUCTION:  NEXT_PUBLIC_USE_MOCK_DATA: "false" + DATA4REV_AUTH_TOKEN');
}

// Run the generator
showFullConfiguration();
