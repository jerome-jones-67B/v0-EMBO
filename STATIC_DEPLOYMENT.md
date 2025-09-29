# Static Deployment Guide

This application has been configured to build as a static site that makes direct API calls to the Data4Rev API.

## Key Changes Made

### 1. API Client Configuration

- Updated `lib/config.ts` to point directly to Data4Rev API
- Modified `lib/api-client.ts` to use Data4Rev authentication
- Removed dependency on local API routes

### 2. Next.js Configuration

- Added `output: 'export'` to `next.config.mjs` for static builds
- Enabled `trailingSlash: true` for better static hosting compatibility
- Kept `images.unoptimized: true` for static hosting

### 3. Authentication Changes

- Removed NextAuth session-based authentication
- Using Data4Rev API token authentication directly
- Authentication handled via `NEXT_PUBLIC_DATA4REV_AUTH_TOKEN` environment variable

### 4. Removed Features

- All API routes in `/app/api/` have been removed
- Download functionality disabled (needs Data4Rev API support)
- Validation submission disabled (needs Data4Rev API support)
- Real-time features disabled (SSE not available in static mode)

## Environment Variables

### Required for Static Build

```bash
NEXT_PUBLIC_DATA4REV_API_BASE_URL=https://your-data4rev-api-url/api
NEXT_PUBLIC_DATA4REV_AUTH_TOKEN=your_api_token_here
```

### Optional Configuration

```bash
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## CORS Configuration

The Data4Rev API must be configured to allow CORS requests from your static site domain:

```
Access-Control-Allow-Origin: https://your-static-site-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Build and Deploy

### Build Static Site

```bash
npm run build
```

This will generate static files in the `out/` directory.

### Deploy to Static Hosting

#### Vercel

```bash
vercel --prod
```

#### Netlify

```bash
netlify deploy --prod --dir=out
```

#### AWS S3 + CloudFront

Upload the `out/` directory contents to S3 and configure CloudFront distribution.

#### GitHub Pages

Enable GitHub Pages and point to the `out/` directory or configure GitHub Actions.

## API Requirements

The Data4Rev API needs to support:

1. **CORS Configuration**: Allow requests from static site domain
2. **Authentication**: Bearer token authentication
3. **Endpoints**: All manuscript, figure, and file management endpoints
4. **File Downloads**: Direct download URLs or API endpoints for file access

## Limitations in Static Mode

1. **No Server-Side Processing**: All logic runs client-side
2. **No File Uploads**: Would need direct upload to Data4Rev API
3. **No Real-time Updates**: No Server-Sent Events or WebSockets
4. **CORS Dependent**: Completely dependent on Data4Rev API CORS policy
5. **Security**: API token is visible in client-side code (use read-only tokens if possible)

## Security Considerations

1. **API Token Exposure**: The `NEXT_PUBLIC_DATA4REV_AUTH_TOKEN` is visible in client-side code
2. **Use Read-Only Tokens**: If possible, use tokens with limited scope for client-side use
3. **CORS Protection**: Rely on Data4Rev API's CORS policy for request filtering
4. **Domain Whitelisting**: Configure Data4Rev API to only accept requests from authorized domains

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check Data4Rev API CORS configuration
2. **Authentication Failures**: Verify API token is valid and not expired
3. **Build Failures**: Ensure all environment variables are set with `NEXT_PUBLIC_` prefix
4. **404 Errors**: Configure static hosting to serve index.html for client-side routing

### Testing

1. **Local Testing**: Use `npm run build && npx serve out` to test static build locally
2. **API Testing**: Verify Data4Rev API endpoints are accessible from browser
3. **CORS Testing**: Check browser network tab for CORS errors
