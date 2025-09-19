#!/bin/bash

# Test Deployment Script for EMBO v0 App
# Usage: ./scripts/test-deployment.sh [BASE_URL]

BASE_URL=${1:-"https://v0-embo-wine.vercel.app"}

echo "🧪 Testing EMBO Deployment at: $BASE_URL"
echo "=================================="

# Test 1: Health Check (Basic connectivity)
echo "1️⃣  Testing basic connectivity..."
response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL")
if [ "$response" = "200" ]; then
    echo "✅ Basic connectivity: OK"
else
    echo "❌ Basic connectivity failed: HTTP $response"
fi

# Test 2: API Base Endpoint
echo -e "\n2️⃣  Testing API base endpoint..."
response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/v1/manuscripts")
if [ "$response" = "200" ] || [ "$response" = "401" ]; then
    echo "✅ API endpoint reachable: HTTP $response"
else
    echo "❌ API endpoint failed: HTTP $response"
fi

# Test 3: Validation Endpoint (specific issue)
echo -e "\n3️⃣  Testing validation endpoint..."
response=$(curl -s -w "%{http_code}" -o /tmp/validation_response.json "$BASE_URL/api/v1/manuscripts/3/validation" -H "Referer: $BASE_URL/")
echo "Response Code: $response"
if [ "$response" = "200" ]; then
    echo "✅ Validation endpoint: OK"
    echo "Response preview:"
    head -n 5 /tmp/validation_response.json
elif [ "$response" = "401" ]; then
    echo "⚠️  Validation endpoint: Authentication required (expected in production)"
else
    echo "❌ Validation endpoint failed: HTTP $response"
    echo "Response:"
    cat /tmp/validation_response.json
fi

# Test 4: Image Endpoint (specific issue)
echo -e "\n4️⃣  Testing image endpoint..."
response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/v1/manuscripts/3/figures/24/image?type=full&apiMode=true")
echo "Response Code: $response"
if [ "$response" = "200" ]; then
    echo "✅ Image endpoint: OK"
elif [ "$response" = "302" ]; then
    echo "✅ Image endpoint: Redirect to placeholder (OK for fallback)"
elif [ "$response" = "401" ]; then
    echo "⚠️  Image endpoint: Authentication required (expected in production)"
else
    echo "❌ Image endpoint failed: HTTP $response"
fi

# Test 5: Mock Data vs API Mode
echo -e "\n5️⃣  Testing data source configuration..."
response=$(curl -s "$BASE_URL/api/v1/manuscripts?page=0&pagesize=1" -H "Referer: $BASE_URL/")
if echo "$response" | grep -q '"source"'; then
    source=$(echo "$response" | grep -o '"source":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Data source detected: $source"
else
    echo "⚠️  Could not determine data source (might need authentication)"
fi

echo -e "\n🏁 Test Summary"
echo "================"
echo "If you see 401 errors, that's normal for production deployment with authentication enabled."
echo "If you see 500 errors, check your environment variables and Vercel logs."
echo "If you see 404 errors on API endpoints, verify your deployment completed successfully."

echo -e "\n📋 Next Steps:"
echo "1. Update DATA4REV_AUTH_TOKEN in your Vercel environment variables"
echo "2. Redeploy your application"
echo "3. Run this test again to verify fixes"

# Cleanup
rm -f /tmp/validation_response.json
