# 🎬 Simple Demo Deployment Guide

## ⚡ Quick Setup - No Google OAuth Required

Perfect for initial stakeholder demos with email/password authentication only.

### 🚀 Step-by-Step Deployment

#### 1. **Vercel Dashboard Setup**

- Go to: [vercel.com/dashboard](https://vercel.com/dashboard)
- Select your connected project
- Navigate to: **Settings → Environment Variables**
- Add these variables for **Production** environment:

```bash
NEXTAUTH_URL=https://v0-embo.vercel.app
NEXTAUTH_SECRET=0s91uq+rrqC76nxe3TzD3fi9bUmXwspeuEOcDxQ/UCg=
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_BASE_URL=https://v0-embo.vercel.app/api
DATA4REV_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api
DATA4REV_AUTH_TOKEN=demo-token
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_ENABLE_REALTIME=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
NODE_ENV=production
```

#### 2. **Deploy**

After adding environment variables, Vercel will automatically redeploy your app.

#### 3. **Test Your Demo**

Visit: `https://v0-embo.vercel.app`

---

## 👥 Demo Login Credentials

Use these accounts for demonstrations:

| Role         | Email               | Password      | Features                         |
| ------------ | ------------------- | ------------- | -------------------------------- |
| **Admin**    | `admin@embo.org`    | `admin123`    | Full access to all features      |
| **Editor**   | `editor@embo.org`   | `editor123`   | Manuscript editing and review    |
| **Reviewer** | `reviewer@embo.org` | `reviewer123` | Review and feedback capabilities |

---

## ✨ What You Get

### ✅ **Authentication**

- Email/password login (no external OAuth setup)
- Three demo user accounts with different roles
- Secure session management

### ✅ **Full Feature Demo**

- Complete manuscript management interface
- AI-powered quality checks
- Figure and panel management
- Source data linking
- Review workflow

### ✅ **Mock Data**

- Sample manuscripts with realistic content
- Pre-populated figures and panels
- Simulated AI checks and QC results
- No external API dependencies

### ✅ **Professional UI**

- Modern, responsive design
- Real-time interactions
- Smooth loading states
- Production-quality experience

---

## 🎯 Perfect For

- **Stakeholder Presentations**: Show complete functionality
- **User Acceptance Testing**: Let users interact with the system
- **Feature Demonstrations**: Walk through key capabilities
- **Client Meetings**: Professional demo environment

---

## 🔧 Alternative: CLI Setup

If you prefer using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel
vercel login

# Set environment variables (you'll be prompted for values)
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_USE_MOCK_DATA production
# ... (continue with all variables above)

# Deploy
vercel --prod
```

---

## 🚨 Important Notes

1. **Project Name**: Using your Vercel project name `v0-embo`
2. **Demo Only**: This configuration uses mock data and demo credentials
3. **No External APIs**: No Google OAuth or real Data4Rev API integration required
4. **Immediate Access**: Demo accounts work immediately after deployment

---

## 🎉 Ready in Minutes!

Your professional demo environment will be live and ready for stakeholder presentations in just a few minutes. No complex OAuth setup, no external API coordination - just a clean, functional demonstration of your manuscript management system.

**Happy demoing! 🎬**

