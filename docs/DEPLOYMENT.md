# 🚀 EMBO Dashboard - Vercel Deployment Guide

## Quick Deploy (Recommended)

### 1. **Deploy via Vercel Website**
1. Go to [vercel.com](https://vercel.com) and sign up/log in with GitHub
2. Click **"Add New..." → "Project"**
3. Import repository: `jerome-jones-67B/v0-EMBO`
4. Vercel will auto-detect Next.js settings

### 2. **Environment Variables**
Add these in Vercel dashboard under **Settings → Environment Variables**:

```env
NEXT_PUBLIC_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE3NTcyNDUzNzAsImV4cCI6MTc1NzMzMTc3MCwiYXVkIjoiZGF0YTRyZXYiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.oSDBWQwSlFvCFTOg3T05h5ISd_RG8k9qpMld7etFwXw
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_REALTIME=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
```

### 3. **Deploy**
- Click **"Deploy"** - Vercel will build and deploy automatically
- Your app will be live at: `https://your-project-name.vercel.app`

## Features Available After Deployment

✅ **Mock Data Mode**: Rich demonstration data (18 manuscripts)  
✅ **API Data Mode**: Live Data4Rev API (4 real manuscripts)  
✅ **Data Source Switcher**: Toggle between Mock ↔ API  
✅ **Manuscript Management**: Full dashboard functionality  
✅ **Responsive Design**: Works on all devices  

## Automatic Deployments

Once set up, Vercel will automatically deploy when you:
- Push to the `main` branch on GitHub
- Merge pull requests

## Custom Domain (Optional)

1. Go to **Settings → Domains** in Vercel
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

- **Build fails**: Check environment variables are set correctly
- **API not working**: Verify the auth token hasn't expired
- **Images not loading**: All images are in the `/public` folder and should work

## Project Structure

```
EMBO v2/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utilities and data services
├── public/             # Static assets (images)
├── vercel.json         # Vercel configuration
└── DEPLOYMENT.md       # This file
```

---

**🎯 Ready to deploy!** The project is fully configured for Vercel deployment.