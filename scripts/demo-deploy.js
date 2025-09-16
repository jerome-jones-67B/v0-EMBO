#!/usr/bin/env node

/**
 * Simple Demo Deployment for EMBO Manuscript Management
 * 
 * Features:
 * - Email/password authentication with demo accounts
 * - No Google OAuth required
 * - Mock data for demonstrations
 * - Ready for stakeholder presentations
 * 
 * Usage: node scripts/demo-deploy.js
 */

const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

function generateDemoSecrets() {
  return {
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('base64')
  };
}

function getDemoConfiguration(projectName, secrets) {
  return {
    // 🔐 Authentication (Email/Password only)
    NEXTAUTH_URL: `https://${projectName}.vercel.app`,
    NEXTAUTH_SECRET: secrets.NEXTAUTH_SECRET,
    
    // 🎯 Demo Settings
    NEXT_PUBLIC_USE_MOCK_DATA: 'true',
    
    // 🔗 API Configuration  
    NEXT_PUBLIC_API_BASE_URL: `https://${projectName}.vercel.app/api`,
    DATA4REV_API_BASE_URL: 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api',
    DATA4REV_AUTH_TOKEN: 'demo-token',
    
    // ⚙️ App Configuration
    NEXT_PUBLIC_API_TIMEOUT: '10000',
    NEXT_PUBLIC_API_RETRIES: '3',
    NEXT_PUBLIC_ENABLE_REALTIME: 'false',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
    NEXT_PUBLIC_MAX_FILE_SIZE: '52428800',
    NODE_ENV: 'production'
  };
}

function displayDemoCredentials() {
  log('cyan', '👥 Demo Login Credentials:');
  log('bright', '━'.repeat(40));
  log('green', '📧 Email: admin@embo.org');
  log('green', '🔑 Password: admin123');
  log('bright', '');
  log('green', '📧 Email: editor@embo.org'); 
  log('green', '🔑 Password: editor123');
  log('bright', '');
  log('green', '📧 Email: reviewer@embo.org');
  log('green', '🔑 Password: reviewer123');
  log('bright', '━'.repeat(40));
}

function displaySetupInstructions(config, projectName) {
  log('cyan', '🚀 EMBO Demo Deployment - Simple Email/Password Auth\n');
  
  log('yellow', '📋 Vercel Dashboard Setup:');
  log('bright', '1. Go to: https://vercel.com/dashboard');
  log('bright', `2. Select your project: ${projectName}`);
  log('bright', '3. Settings → Environment Variables');
  log('bright', '4. Add these variables (Production environment):\n');
  
  Object.entries(config).forEach(([key, value]) => {
    log('bright', `${key}=${value}`);
  });
  
  log('yellow', '\n5. Deploy your app');
  log('bright', '6. Visit: https://' + projectName + '.vercel.app\n');
  
  displayDemoCredentials();
  
  log('cyan', '\n✨ Demo Features:');
  log('green', '  ✅ Email/password authentication');
  log('green', '  ✅ Three demo user accounts');
  log('green', '  ✅ Full manuscript management UI');
  log('green', '  ✅ Mock data for demonstrations');
  log('green', '  ✅ No external API dependencies');
  log('green', '  ✅ Ready for stakeholder presentations');
  
  log('yellow', '\n🎯 Perfect for:');
  log('bright', '  • Initial stakeholder demos');
  log('bright', '  • UI/UX presentations');
  log('bright', '  • Feature walkthroughs');
  log('bright', '  • User acceptance testing');
}

function generateVercelCliCommands(config, projectName) {
  log('cyan', '\n📱 Alternative: Vercel CLI Setup');
  log('bright', '━'.repeat(50));
  log('yellow', '# Install and login to Vercel CLI:');
  log('bright', 'npm i -g vercel');
  log('bright', 'vercel login\n');
  
  log('yellow', '# Set environment variables:');
  Object.entries(config).forEach(([key, value]) => {
    log('bright', `vercel env add ${key} production`);
    log('green', `# Enter value: ${value}`);
  });
  
  log('yellow', '\n# Deploy:');
  log('bright', 'vercel --prod\n');
}

// Main execution
function main() {
  const projectName = 'v0-embo';
  const secrets = generateDemoSecrets();
  const config = getDemoConfiguration(projectName, secrets);
  
  displaySetupInstructions(config, projectName);
  generateVercelCliCommands(config, projectName);
  
  log('cyan', '🎉 Your demo app will be ready in minutes!');
  log('yellow', 'No Google OAuth setup required - just email/password login.');
}

main();
