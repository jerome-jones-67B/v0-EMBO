# Data4Rev Flow - EMBO Manuscript Processing System

A Next.js-based web application for managing scientific manuscript figures, quality checks, and source data for the EMBO peer review process.

## Overview

Data4Rev Flow is a comprehensive manuscript management system designed to streamline the EMBO peer review workflow. It provides tools for viewing, annotating, and quality-checking scientific figures, managing source data files, and tracking manuscript metadata throughout the review process.

### Key Capabilities

- **Manuscript Dashboard**: Browse and filter manuscripts with AI-powered quality checks
- **Figure Management**: View figures with panel detection, bounding boxes, and annotations
- **Source Data Management**: Hierarchical file tree with drag-and-drop mapping to figures/panels
- **AI Quality Checks**: View and override automated quality checks with severity indicators
- **External Links**: Manage links to databases (PDB, UniProt, EMDB, etc.) at manuscript, figure, and panel levels
- **Follow-up Reports**: Generate markdown reports of flagged items for downstream processing

## Tech Stack

- **Framework**: Next.js 14 (React 18) with App Router
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI primitives
- **State Management**: React hooks with local state
- **API Client**: Custom fetch-based client with OpenAPI integration
- **Authentication**: NextAuth.js with Google OAuth
- **Testing**: Jest with React Testing Library

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Access to Data4Rev API (staging or production)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
   cd ui
```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/v1
   NEXT_PUBLIC_USE_MOCK_DATA=false

   # Authentication (NextAuth.js)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key_here

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

````

   Application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Type checking
npm run typecheck

# Build static export
npm run build

# Preview production build
npm run preview
````

## Project Structure

```
ui/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Dashboard home page
├── components/              # React components
│   ├── manuscript/          # Manuscript-specific components
│   │   ├── figure-list.tsx
│   │   ├── figure-viewer.tsx
│   │   ├── source-files-treeview.tsx
│   │   └── ...
│   ├── ui/                  # Reusable UI components
│   └── manuscript-dashboard.tsx
├── hooks/                   # Custom React hooks
│   ├── useApiDataLoader.ts
│   ├── useManuscriptDetailApi.ts
│   └── ...
├── lib/                     # Utility functions and types
│   ├── api-client.ts        # API integration layer
│   ├── types.ts             # TypeScript type definitions
│   ├── data-transformer.ts  # API response transformers
│   └── utils/               # Helper utilities
├── types/                   # Global TypeScript types
├── __tests__/              # Test suites
└── public/                 # Static assets
```

## Available Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start development server on port 3000 |
| `npm run build`         | Build production bundle               |
| `npm run start`         | Start production server               |
| `npm run typecheck`     | Run TypeScript compiler checks        |
| `npm run lint`          | Run ESLint                            |
| `npm test`              | Run test suite                        |
| `npm run test:watch`    | Run tests in watch mode               |
| `npm run test:coverage` | Generate coverage report              |

## API Integration

The application integrates with the Data4Rev REST API. Key endpoints include:

- `GET /manuscripts` - List manuscripts with pagination and filtering
- `GET /manuscripts/{id}` - Get manuscript details with figures and checks
- `POST /manuscripts/{id}/source_data` - Assign source files
- `POST /manuscripts/{id}/links` - Add external database links
- `PATCH /manuscripts/{manuscript_id}/figures/{figure_id}/panels/{panel_id}` - Update panel properties

See `lib/api-client.ts` for the complete API client implementation.

## Authentication

The system supports multiple authentication methods:

1. **Google OAuth** - Primary method for production
2. **Email/Password** - Fallback credentials-based auth
3. **Mock Mode** - Development without authentication (set `NEXT_PUBLIC_USE_MOCK_DATA=true`)

Authentication is handled by NextAuth.js with session management and protected routes via the `AuthGuard` component.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in `__tests__/` with a structure mirroring the source code.

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds on push

### Static Export

The application supports static export for hosting on any web server:

```bash
npm run build
# Static files will be in the 'out' directory
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- No IE support

## Contributing

### Code Style

- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Conventional commits preferred

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run `npm run typecheck` and `npm run lint`
4. Submit PR with descriptive title and summary

## Troubleshooting

### Common Issues

**API Connection Errors**

- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check network connectivity to Data4Rev API
- Ensure authentication token is valid

**Build Failures**

- Run `npm run typecheck` to identify type errors
- Clear `.next` directory and rebuild
- Verify all dependencies are installed

**Authentication Issues**

- Check `NEXTAUTH_URL` matches your deployment URL
- Verify OAuth credentials are configured correctly
- Clear browser cookies and retry

## License

Proprietary - EMBO/67Bricks

## Support

For technical support or questions, contact the development team or refer to STATUS.md and DOCUMENTATION.md for additional details.
