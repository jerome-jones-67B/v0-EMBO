#!/bin/bash

# Quick Vercel Deployment Script for EMBO Manuscript Management System
# Usage: ./scripts/quick-deploy.sh [demo|production]

MODE=${1:-demo}
PROJECT_NAME="v0-embo"

echo "🚀 Quick Vercel Deployment - Mode: $MODE"
echo "================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Generate and apply environment variables
echo "📋 Setting up environment variables..."
node scripts/vercel-secrets.js $MODE

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Login to Vercel: vercel login"
echo "2. Deploy: vercel --prod"
echo "3. Visit your app: https://$PROJECT_NAME.vercel.app"
echo ""

if [ "$MODE" = "demo" ]; then
    echo "🎯 Demo mode: No authentication required, mock data enabled"
else
    echo "🏭 Production mode: Update Google OAuth and Data4Rev credentials before deployment"
fi
