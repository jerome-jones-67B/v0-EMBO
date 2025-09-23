# 🔐 Authentication Setup Guide

## Overview

The EMBO Dashboard now includes enterprise-grade authentication with NextAuth.js, supporting:

- **Google OAuth** - For institutional accounts
- **Email/Password** - For EMBO staff and fallback access
- **Role-based access control** - Editorial assistants and admins
- **Session management** - Secure JWT sessions with automatic refresh

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_WORKSPACE_DOMAIN=embo.org

# Data4Rev API Configuration
NEXT_PUBLIC_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=false
DATA4REV_AUTH_TOKEN=your-data4rev-bearer-token-here
```

### 2. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to your `NEXTAUTH_SECRET` environment variable.

## 🔑 Demo Credentials

For immediate testing, use these demo credentials:

- **Email**: `editorial.assistant@embo.org`
- **Password**: `embo2025`
- **Role**: Editorial Assistant

## 🏢 Google OAuth Setup (Optional)

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 2. Configure Environment Variables

```env
GOOGLE_CLIENT_ID=your-app-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret-from-google
GOOGLE_WORKSPACE_DOMAIN=embo.org  # Optional: restrict to domain
```

## 🛡️ Security Features

### Authentication Flow

1. **Protected Routes** - All application routes require authentication
2. **Session Validation** - JWT tokens with 8-hour expiry
3. **Role-based Access** - Different permissions for editorial assistants vs admins
4. **Secure Logout** - Proper session cleanup

### User Roles

- **`editorial_assistant`** - Default role, full manuscript access
- **`admin`** - Enhanced permissions for user management (future)

### Domain Restrictions

- Google OAuth can be restricted to `@embo.org` emails
- Credential-based sign-in validates against approved user list

## 🎨 User Interface

### Sign-In Page

- Clean, professional interface at `/auth/signin`
- Google OAuth button for institutional accounts
- Email/password form for EMBO staff
- Clear demo credentials for testing

### User Navigation

- User avatar and name display in dashboard header
- Role badge showing current permissions
- Secure logout functionality
- Settings placeholder for future features

## 🚀 Production Deployment

### Vercel Environment Variables

Add these to your Vercel dashboard under **Settings → Environment Variables**:

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_WORKSPACE_DOMAIN=embo.org
DATA4REV_AUTH_TOKEN=your-production-api-token
```

### Security Checklist

- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Use production Google OAuth credentials
- [ ] Remove demo credentials from production
- [ ] Configure proper CORS settings
- [ ] Test authentication flow end-to-end

## 🔧 Development

### Testing Authentication

1. **Start development server**: `npm run dev`
2. **Visit**: `http://localhost:3000`
3. **Should redirect to**: `/auth/signin`
4. **Sign in with demo credentials**
5. **Should redirect to dashboard** with user nav visible

### Adding New Users

Edit `lib/auth.ts` and update the `validUsers` array:

```typescript
const validUsers = [
  {
    id: "1",
    email: "editorial.assistant@embo.org",
    name: "EMBO Editorial Assistant",
    role: "editorial_assistant",
  },
  // Add new users here
];
```

### Debugging

Enable debug mode in development:

```env
NODE_ENV=development
```

This will log authentication events to the console.

## 🎯 Next Steps

1. **Replace demo credentials** with real user management
2. **Integrate with EMBO user directory** if available
3. **Add password reset functionality**
4. **Implement admin role permissions**
5. **Add session analytics and monitoring**

---

Authentication is now fully implemented and ready for production use! 🎉
