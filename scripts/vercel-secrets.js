#!/usr/bin/env node

/**
 * Vercel Secrets Manager for EMBO Manuscript Management System
 * 
 * Usage:
 *   node scripts/vercel-secrets.js generate    # Generate all secrets
 *   node scripts/vercel-secrets.js demo       # Setup for demo deployment
 *   node scripts/vercel-secrets.js production # Setup for production deployment
 *   node scripts/vercel-secrets.js validate   # Validate current environment
 */

const crypto = require('crypto');
const { execSync } = require('child_process');

const command = process.argv[2] || 'generate';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Generate secure secrets
function generateSecrets() {
  return {
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('base64'),
    // Generate a sample JWT for demo purposes
    DEMO_JWT: crypto.randomBytes(16).toString('hex')
  };
}

// Get Vercel project name from package.json or use actual project name
function getProjectName() {
  return 'v0-embo'; // Actual Vercel project name
}

// Environment variable configurations
function getEnvironmentConfig(mode, projectName, secrets) {
  const baseUrl = `https://${projectName}.vercel.app/api`;
  
  const configs = {
    demo: {
      // 🔐 Authentication
      NEXTAUTH_URL: `https://${projectName}.vercel.app`,
      NEXTAUTH_SECRET: secrets.NEXTAUTH_SECRET,
      
      // 🎯 Demo Mode Settings
      BYPASS_AUTH: 'true',
      NEXT_PUBLIC_USE_MOCK_DATA: 'true',
      
      // 🔗 API Configuration
      NEXT_PUBLIC_API_BASE_URL: baseUrl,
      DATA4REV_API_BASE_URL: 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api',
      DATA4REV_AUTH_TOKEN: 'demo-token-not-needed',
      
      // ⚙️ App Settings
      NEXT_PUBLIC_API_TIMEOUT: '10000',
      NEXT_PUBLIC_API_RETRIES: '3',
      NEXT_PUBLIC_ENABLE_REALTIME: 'false',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
      NEXT_PUBLIC_MAX_FILE_SIZE: '52428800',
      NODE_ENV: 'production'
    },
    
    production: {
      // 🔐 Authentication (Required)
      NEXTAUTH_URL: `https://${projectName}.vercel.app`,
      NEXTAUTH_SECRET: secrets.NEXTAUTH_SECRET,
      
      // 🌐 Google OAuth (Add your credentials)
      GOOGLE_CLIENT_ID: 'your-google-oauth-client-id',
      GOOGLE_CLIENT_SECRET: 'your-google-oauth-client-secret',
      GOOGLE_WORKSPACE_DOMAIN: 'yourdomain.com',
      
      // 🔗 API Configuration
      NEXT_PUBLIC_API_BASE_URL: baseUrl,
      DATA4REV_API_BASE_URL: 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api',
      DATA4REV_AUTH_TOKEN: 'your-real-data4rev-token',
      
      // 🛡️ Production Settings
      BYPASS_AUTH: 'false',
      NEXT_PUBLIC_USE_MOCK_DATA: 'false',
      
      // ⚙️ App Settings
      NEXT_PUBLIC_API_TIMEOUT: '10000',
      NEXT_PUBLIC_API_RETRIES: '3',
      NEXT_PUBLIC_ENABLE_REALTIME: 'false',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
      NEXT_PUBLIC_MAX_FILE_SIZE: '52428800',
      NODE_ENV: 'production'
    }
  };
  
  return configs[mode] || configs.demo;
}

// Generate Vercel CLI commands
function generateVercelCommands(config, projectName) {
  const commands = [];
  
  log('cyan', '📋 Copy and run these Vercel CLI commands:\n');
  log('yellow', '# Make sure you have Vercel CLI installed and logged in:');
  log('bright', 'npm i -g vercel');
  log('bright', 'vercel login\n');
  
  log('yellow', `# Set environment variables for project: ${projectName}`);
  
  Object.entries(config).forEach(([key, value]) => {
    const command = `vercel env add ${key} production`;
    commands.push({ command, value, key });
    log('bright', command);
  });
  
  log('yellow', '\n# After setting all variables, redeploy:');
  log('bright', 'vercel --prod\n');
  
  return commands;
}

// Generate manual setup instructions
function generateManualInstructions(config, projectName) {
  log('cyan', '🌐 Manual Setup via Vercel Dashboard:\n');
  log('yellow', '1. Go to: https://vercel.com/dashboard');
  log('yellow', `2. Select your project: ${projectName}`);
  log('yellow', '3. Go to Settings → Environment Variables');
  log('yellow', '4. Add these variables for "Production" environment:\n');
  
  Object.entries(config).forEach(([key, value]) => {
    log('bright', `${key}=${value}`);
  });
  
  log('yellow', '\n5. Redeploy your application\n');
}

// Validate environment setup
function validateEnvironment() {
  log('cyan', '🔍 Validating Environment Configuration...\n');
  
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_API_BASE_URL',
    'DATA4REV_API_BASE_URL'
  ];
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });
  
  if (present.length > 0) {
    log('green', '✅ Found environment variables:');
    present.forEach(varName => log('green', `  - ${varName}`));
    console.log();
  }
  
  if (missing.length > 0) {
    log('red', '❌ Missing environment variables:');
    missing.forEach(varName => log('red', `  - ${varName}`));
    console.log();
    log('yellow', 'Run: node scripts/vercel-secrets.js demo');
    log('yellow', 'Or: node scripts/vercel-secrets.js production');
  } else {
    log('green', '🎉 All required environment variables are set!');
  }
}

// Main execution
function main() {
  const projectName = getProjectName();
  const secrets = generateSecrets();
  
  log('bright', '🚀 EMBO Manuscript Management - Vercel Secrets Manager\n');
  
  switch (command) {
    case 'generate':
    case 'demo':
      log('cyan', '🎯 DEMO DEPLOYMENT SETUP');
      log('yellow', 'Perfect for: Presentations, testing, stakeholder demos');
      log('yellow', 'Features: Mock data, bypass authentication, immediate access\n');
      
      const demoConfig = getEnvironmentConfig('demo', projectName, secrets);
      generateManualInstructions(demoConfig, projectName);
      generateVercelCommands(demoConfig, projectName);
      
      log('green', '💡 Demo benefits:');
      log('green', '  ✅ No external API setup needed');
      log('green', '  ✅ No authentication required');
      log('green', '  ✅ Immediate access for stakeholders');
      log('green', '  ✅ Full UI/UX demonstration\n');
      break;
      
    case 'production':
      log('cyan', '🏭 PRODUCTION DEPLOYMENT SETUP');
      log('yellow', 'Features: Real authentication, external API integration, full security\n');
      
      const prodConfig = getEnvironmentConfig('production', projectName, secrets);
      generateManualInstructions(prodConfig, projectName);
      generateVercelCommands(prodConfig, projectName);
      
      log('red', '⚠️  Before production deployment:');
      log('red', '  🔑 Get Google OAuth credentials');
      log('red', '  🔗 Get real Data4Rev API token');
      log('red', '  📝 Update placeholder values above\n');
      break;
      
    case 'validate':
      validateEnvironment();
      break;
      
    default:
      log('red', '❌ Unknown command. Available commands:');
      log('yellow', '  generate    - Generate secrets for demo');
      log('yellow', '  demo        - Setup demo deployment');
      log('yellow', '  production  - Setup production deployment');
      log('yellow', '  validate    - Validate current environment');
  }
}

main();
