# Vercel Deployment Guide for EMBO Manuscript Management System

## 🚀 Quick Deployment Steps

### 1. Prepare Repository

```bash
# Ensure your code is pushed to GitHub/GitLab/Bitbucket
git add .
git commit -m "Production ready for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your repository
4. Select "Next.js" framework (auto-detected)
5. Click "Deploy" (initial deployment will fail without env vars)

### 3. Configure Environment Variables

In your Vercel dashboard → Project → Settings → Environment Variables, add:

#### 🔐 **Authentication (NextAuth.js)**

```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-jwt-key-min-32-chars
```

#### 🌐 **Google OAuth (Optional)**

```
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_WORKSPACE_DOMAIN=yourdomain.com
```

#### 🔗 **API Configuration**

```
NEXT_PUBLIC_API_BASE_URL=https://your-app-name.vercel.app/api
DATA4REV_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api
DATA4REV_AUTH_TOKEN=your-data4rev-api-token
```

#### ⚙️ **App Configuration**

```
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_REALTIME=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
NODE_ENV=production
```

#### 🛠️ **Development Bypass (Set to false for production)**

```
BYPASS_AUTH=false
```

## 🔑 **How to Generate Secrets**

### NEXTAUTH_SECRET

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `https://your-app-name.vercel.app/api/auth/callback/google`

### Data4Rev API Token

- Contact your Data4Rev API administrator for a production token
- For staging: Use your existing staging token

## 🌍 **Domain Configuration**

### Custom Domain (Optional)

1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` to your custom domain
4. Update OAuth redirect URIs

## ⚡ **Vercel Configuration**

The app includes optimized `vercel.json` for production deployment with proper caching and performance settings.

## 🧪 **Testing Deployment**

### 1. Check Build Logs

- Monitor deployment in Vercel dashboard
- Check for any build errors

### 2. Test Authentication

- Visit: `https://your-app-name.vercel.app/auth/signin`
- Test Google OAuth login
- Test demo credentials (if enabled)

### 3. Test API Integration

- Toggle API mode in the app
- Verify manuscript loading
- Check fallback to mock data

### 4. Verify Environment Variables

- Check Vercel Functions logs for env var loading
- Ensure no sensitive data in client-side

## 🚨 **Security Checklist**

- ✅ `NEXTAUTH_SECRET` is strong and unique
- ✅ `DATA4REV_AUTH_TOKEN` is production-ready
- ✅ `BYPASS_AUTH=false` in production
- ✅ Google OAuth redirect URIs match your domain
- ✅ No secrets exposed in client-side code
- ✅ Environment variables are production environment only

## 📊 **Performance Optimizations**

- ✅ Static pages pre-rendered
- ✅ API routes optimized for serverless
- ✅ Images optimized with Next.js Image component
- ✅ Memoized components for better performance

## 🔧 **Troubleshooting**

### Common Issues

**Build Fails:**

- Check TypeScript errors in build logs
- Ensure all dependencies are in package.json

**Authentication Errors:**

- Verify `NEXTAUTH_URL` matches your Vercel domain
- Check `NEXTAUTH_SECRET` is set and valid

**API Integration Issues:**

- Verify `NEXT_PUBLIC_API_BASE_URL` points to your Vercel app
- Check `DATA4REV_AUTH_TOKEN` is valid
- Monitor API route logs in Vercel Functions

**Environment Variable Issues:**

- Ensure variables are set in correct environment (Production/Preview/Development)
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new environment variables

## 📱 **Post-Deployment**

1. **Update Documentation**: Update any URLs in README or docs
2. **Monitor Performance**: Use Vercel Analytics
3. **Set Up Monitoring**: Configure error tracking if needed
4. **Backup Strategy**: Ensure critical data is backed up

## 🎯 **Demo Configuration**

For demo purposes, you can temporarily set:

```
NEXT_PUBLIC_USE_MOCK_DATA=true
BYPASS_AUTH=true
```

This will allow immediate access without authentication setup for demonstration.

---

**🎉 Your EMBO Manuscript Management System should now be live on Vercel!**

Visit your deployment URL and verify all features are working correctly.
