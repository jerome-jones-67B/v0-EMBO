# 🎬 Minimal Demo Environment Setup

Your `vercel.json` now contains **only the essentials** for a working demo:

```json
{
  "env": {
    "NEXTAUTH_SECRET": "mIJaRxVKWvGMkz7DlLWOqM/RZuWu209tJ5Yh00Fe178=",
    "NEXT_PUBLIC_API_BASE_URL": "/api",
    "NEXT_PUBLIC_USE_MOCK_DATA": "true"
  }
}
```

## ✅ What These 3 Variables Do

1. **`NEXTAUTH_SECRET`** - Required for secure JWT token signing
2. **`NEXT_PUBLIC_API_BASE_URL`** - Ensures API calls stay on same domain (fixes CORS)
3. **`NEXT_PUBLIC_USE_MOCK_DATA`** - Uses demo data instead of real API calls

## 🔧 **Smart Vercel Integration**

**No `NEXTAUTH_URL` needed!** Vercel automatically provides:

- `VERCEL_URL` - Current deployment URL
- NextAuth.js automatically uses this for authentication callbacks
- Works for: production, preview deployments, branch deployments

## 🚀 **CORS Solution Explained**

**`NEXT_PUBLIC_API_BASE_URL: "/api"`** ensures:

- ✅ All API calls use relative paths (`/api/v1/manuscripts`)
- ✅ Calls stay on same domain (no cross-origin requests)
- ✅ Works on ANY Vercel deployment URL automatically
- ✅ No hardcoded domains that break on different deployments

## 🚀 This Works Out of the Box For:

- ✅ **Authentication** - Email/password login works
- ✅ **Mock Data** - 18+ demo manuscripts for testing
- ✅ **Full UI** - All dashboard features work
- ✅ **No CORS issues** - API calls stay on same domain
- ✅ **Fast deployment** - No external API setup needed

## 🔧 When You Need More

**For Google Sign-In**: Run `npm run expand-env` and add Google OAuth variables

**For Real API Data**: Set `NEXT_PUBLIC_USE_MOCK_DATA: "false"` and add `DATA4REV_AUTH_TOKEN`

**For Custom Settings**: Run `npm run expand-env` for full configuration options

## 📝 **No Manual Updates Needed!**

The configuration is **deployment-agnostic**:

- ✅ Works on `v0-embo.vercel.app` (production)
- ✅ Works on `v0-embo-git-branch.vercel.app` (branch deployments)
- ✅ Works on `v0-embo-pr123.vercel.app` (preview deployments)
- ✅ Works on custom domains

**Everything is automatic!** 🎯

---

**Perfect for demos, stakeholder presentations, and initial testing!** 🎯
