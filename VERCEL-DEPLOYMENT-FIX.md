# 🔧 Vercel Deployment Fix Guide

## ❌ Current Issues on https://v0-embo-wine.vercel.app

### 1. Validation Endpoint Failing

```bash
curl 'https://v0-embo-wine.vercel.app/api/v1/manuscripts/3/validation' -H 'Referer: https://v0-embo-wine.vercel.app/'
```

### 2. Image Endpoint Returning 500

```
GET https://v0-embo-wine.vercel.app/api/v1/manuscripts/3/figures/24/image?type=full&apiMode=true
Status: 500
```

## ✅ FIXES APPLIED

### 1. Environment Variables Updated

Your `vercel.json` now includes all required environment variables:

```json
{
  "env": {
    "NEXTAUTH_SECRET": "mIJaRxVKWvGMkz7DlLWOqM/RZuWu209tJ5Yh00Fe178=",
    "NEXTAUTH_URL": "https://v0-embo-wine.vercel.app",
    "NEXT_PUBLIC_API_BASE_URL": "/api",
    "DATA4REV_API_BASE_URL": "https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api",
    "DATA4REV_AUTH_TOKEN": "your-data4rev-api-token-here",
    "NEXT_PUBLIC_API_TIMEOUT": "10000",
    "NEXT_PUBLIC_API_RETRIES": "3",
    "NEXT_PUBLIC_USE_MOCK_DATA": "false",
    "NEXT_PUBLIC_ENABLE_REALTIME": "false",
    "NEXT_PUBLIC_ENABLE_ANALYTICS": "false",
    "NEXT_PUBLIC_MAX_FILE_SIZE": "52428800",
    "NODE_ENV": "production",
    "BYPASS_AUTH": "false"
  }
}
```

### 2. Critical Changes Made:

✅ **Added Missing Environment Variables:**

- `NEXTAUTH_URL` - Required for NextAuth.js authentication
- `DATA4REV_AUTH_TOKEN` - **YOU NEED TO UPDATE THIS**
- `NODE_ENV` - Set to production
- `BYPASS_AUTH` - Set to false for production

✅ **Changed Mock Data Setting:**

- `NEXT_PUBLIC_USE_MOCK_DATA` changed from `"true"` to `"false"` for real API usage

## 🔑 IMMEDIATE ACTION REQUIRED

### 1. Update Your Data4Rev API Token

Replace `"your-data4rev-api-token-here"` in the `vercel.json` with your actual token:

```json
"DATA4REV_AUTH_TOKEN": "your-real-token-here"
```

### 2. Alternative: Use Vercel Dashboard Instead

Instead of `vercel.json`, you can set environment variables in the Vercel dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project: `v0-embo`
3. Go to: **Settings → Environment Variables**
4. Add each variable individually for **Production** environment

## 🚀 DEPLOYMENT STEPS

### Option A: Using vercel.json (Current Setup)

1. **Update the API token in vercel.json:**

   ```bash
   # Edit vercel.json and replace "your-data4rev-api-token-here"
   ```

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment environment variables"
   git push origin main
   ```

### Option B: Using Vercel Dashboard (Recommended)

1. **Remove vercel.json env section** (optional)
2. **Set environment variables in Vercel Dashboard:**
   - Navigate to your project settings
   - Add each variable from the list above
   - Set environment to "Production"

## 🧪 TESTING AFTER DEPLOYMENT

### 1. Test Validation Endpoint:

```bash
curl 'https://v0-embo-wine.vercel.app/api/v1/manuscripts/3/validation' \
  -H 'Referer: https://v0-embo-wine.vercel.app/' \
  -v
```

Expected: Should return validation data (not 404/500)

### 2. Test Image Endpoint:

```bash
curl 'https://v0-embo-wine.vercel.app/api/v1/manuscripts/3/figures/24/image?type=full&apiMode=true' \
  -v
```

Expected: Should return image data or proper fallback (not 500)

### 3. Test Web Interface:

- Visit: https://v0-embo-wine.vercel.app
- Try to log in
- Navigate to a manuscript
- Check if images load

## 🐛 DEBUGGING

### Check Vercel Logs:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Functions** tab
4. Check recent invocations for error details

### Environment Variable Verification:

Add temporary logging to your API routes to verify environment variables are loaded:

```typescript
console.log("Environment check:", {
  hasAuthToken: !!process.env.DATA4REV_AUTH_TOKEN,
  apiBase: process.env.DATA4REV_API_BASE_URL,
  nodeEnv: process.env.NODE_ENV,
});
```

## 📞 SUPPORT

If issues persist after these fixes:

1. **Check Vercel deployment logs** for specific error messages
2. **Verify your Data4Rev API token** is valid and has proper permissions
3. **Test endpoints locally** first with the same environment variables
4. **Contact Data4Rev support** if authentication issues persist

## ⚠️ SECURITY NOTE

- Never commit real API tokens to version control
- Use Vercel dashboard for sensitive environment variables
- Consider using different tokens for staging vs production
