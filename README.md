# EMBO Manuscript Validation Dashboard

A modern, enterprise-grade dashboard for managing and validating scientific manuscripts in the EMBO editorial workflow. Built with Next.js, TypeScript, and integrated with the Data4Rev API for real-time manuscript processing and validation.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

## 🚀 Features

### Core Functionality

- **Real-time Manuscript Management** - Complete manuscript lifecycle tracking
- **Data4Rev API Integration** - Seamless integration with manuscript processing pipeline
- **Advanced Filtering & Search** - Multi-criteria manuscript discovery
- **Status Management** - Comprehensive workflow state tracking
- **File Management** - Manuscript file download and processing
- **Authentication** - Secure access with NextAuth.js integration

### Dashboard Capabilities

- **Interactive Data Tables** - Sortable, filterable manuscript listings
- **Status Visualization** - Real-time workflow state indicators
- **Bulk Operations** - Efficient multi-manuscript management
- **Download Progress** - Real-time file download tracking
- **Priority Management** - Manuscript prioritization system
- **Assignment Tracking** - Editorial staff assignment management

### Technical Features

- **Type-Safe Architecture** - Full TypeScript implementation
- **Responsive Design** - Mobile-first, accessible interface
- **Real-time Updates** - Live data synchronization
- **Error Handling** - Comprehensive error management
- **Testing Coverage** - Jest and React Testing Library
- **Performance Optimized** - Efficient data loading and caching

## 🛠️ Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Modern icon library

### Backend & APIs

- **Data4Rev API** - Manuscript processing and validation
- **NextAuth.js** - Authentication and session management
- **REST APIs** - Custom API endpoints

### Development & Deployment

- **Vercel** - Production hosting and deployment
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting
- **GitHub Actions** - CI/CD pipeline (configured)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Access to Data4Rev API credentials
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd v0-embo

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Configuration

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_BYPASS_AUTH=true  # For development

# Data4Rev API
DATA4REV_API_BASE_URL=https://your-api-endpoint
DATA4REV_AUTH_TOKEN=your-api-token

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false  # Use real API data
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Setup & Configuration](./docs/AUTHENTICATION-SETUP.md)** - Complete setup guide
- **[API Integration](./docs/DATA4REV-API-INTEGRATION.md)** - Data4Rev API integration
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment
- **[Development Guide](./docs/README-REFACTORING.md)** - Code architecture and development
- **[Troubleshooting](./docs/)** - Common issues and solutions

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm test             # Run test suite
```

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── manuscript/       # Manuscript-specific components
│   └── shared/           # Shared components
├── lib/                  # Utility functions and services
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── docs/                 # Documentation
└── public/               # Static assets
```

### Code Quality

This project maintains high code quality standards:

- **TypeScript** - Full type safety
- **ESLint** - Code linting and standards
- **Prettier** - Code formatting
- **Jest** - Unit and integration testing
- **Husky** - Git hooks for quality gates

## 🚀 Deployment

### Production Deployment (Vercel)

1. **Configure Environment Variables**

   ```bash
   # In Vercel dashboard or vercel.json
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=production-secret
   DATA4REV_API_BASE_URL=production-api-url
   ```

2. **Deploy**
   ```bash
   npm run build  # Verify build locally
   # Push to main branch for automatic deployment
   ```

See [Deployment Documentation](./docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- **Authentication** - NextAuth.js with multiple providers
- **API Security** - Bearer token authentication with Data4Rev
- **Environment Variables** - Secure configuration management
- **CORS** - Proper cross-origin resource sharing
- **Input Validation** - Comprehensive data validation

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper TypeScript types
4. **Add tests** for new functionality
5. **Run quality checks** (`npm run lint && npm run typecheck`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages
- Ensure accessibility compliance

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For technical support and questions:

- **Documentation** - Check the [docs/](./docs/) directory
- **Issues** - Use GitHub Issues for bug reports
- **API Questions** - Refer to Data4Rev API documentation

## 🔗 Links

- **[Live Demo](https://v0-embo.vercel.app)** - Production deployment
- **[Data4Rev API](https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/docs)** - API documentation
- **[Component Library](https://ui.shadcn.com/)** - UI component documentation

---

Built with ❤️ for the EMBO editorial team
