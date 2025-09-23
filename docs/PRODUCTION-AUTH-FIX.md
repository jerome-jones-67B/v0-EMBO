# 🔐 Production Authentication Fix

## ❌ Current Problem

Your API endpoints are failing because they're expecting NextAuth.js session cookies, but curl requests don't have them.

The authentication flow is:
1. `shouldBypassAuth()` returns `false` in production (correct)
2. `validateApiAuth()` looks for NextAuth.js session cookies
3. Raw API calls don't have these cookies → 500 error

## ✅ IMMEDIATE FIX OPTIONS

### Option 1: Temporary Demo Mode (Quick Fix)

Set `BYPASS_AUTH=true` in your Vercel environment variables temporarily:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `BYPASS_AUTH` and change it to `"true"`
3. Redeploy

This will allow API calls to work without authentication for demo purposes.

### Option 2: Production API Token (Secure)

Add an API token header for direct API access:

```bash
# Test with API token header
curl 'https://v0-embo-wine.vercel.app/api/v1/manuscripts/3/validation' \
  -H 'Authorization: Bearer your-api-token' \
  -H 'Referer: https://v0-embo-wine.vercel.app/'
```

## 🚀 RECOMMENDED SOLUTION

### Step 1: Enable Demo Mode Temporarily

Update your Vercel environment variables:

```
BYPASS_AUTH=true  # Change from false to true
```

### Step 2: Test After Redeployment

```bash
# Wait for Vercel to redeploy, then test:
./scripts/test-deployment.sh https://v0-embo-wine.vercel.app
```

### Step 3: Verify Web Interface

1. Visit: https://v0-embo-wine.vercel.app
2. You should be able to access the interface without login
3. Images and validation should work

### Step 4: Re-enable Authentication Later

Once you've verified everything works, you can:
1. Set `BYPASS_AUTH=false` for production security
2. Set up proper frontend authentication flow
3. Use session-based access through the web interface

## 🧪 TESTING COMMANDS

After setting `BYPASS_AUTH=true`:

```bash
# Test validation endpoint
curl 'https://v0-embo-wine.vercel.app/api/v1/manuscripts/3/validation' \
  -H 'Referer: https://v0-embo-wine.vercel.app/' \
  -v

# Test image endpoint  
curl 'https://v0-embo-wine.vercel.app/api/v1/manuscripts/3/figures/24/image?type=full&apiMode=true' \
  -v

# Test basic API
curl 'https://v0-embo-wine.vercel.app/api/v1/manuscripts' -v
```

## 📋 ENVIRONMENT VARIABLE SUMMARY

Your current Vercel settings should be:

```
BYPASS_AUTH=true                    # ← CHANGE THIS to true for demo
DATA4REV_AUTH_TOKEN=your-token      # ← Verify this is your real token  
DATA4REV_API_BASE_URL=...          # ← Should be the staging URL
NODE_ENV=production                 # ← This is fine
```

Plus any other NextAuth or app-specific variables you need.

## ⚠️ SECURITY NOTES

- `BYPASS_AUTH=true` disables authentication entirely
- Only use this for demos or development
- For production with real data, implement proper API authentication
- Never expose real API tokens in client-side code

## 🎯 EXPECTED RESULTS

After setting `BYPASS_AUTH=true`:

✅ Validation endpoint should return JSON data (not 500)  
✅ Image endpoint should return images or proper redirects (not 500)  
✅ Web interface should work without login  
✅ All API endpoints should respond correctly  
