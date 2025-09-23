# Code Refactoring Documentation

## Overview

This document outlines the comprehensive refactoring performed on the EMBO manuscript dashboard codebase to improve maintainability, scalability, and adherence to best practices.

## Refactoring Goals

- ✅ **Modularity**: Break down large components into smaller, focused components
- ✅ **Separation of Concerns**: Extract business logic into custom hooks
- ✅ **Type Safety**: Comprehensive TypeScript type definitions
- ✅ **Reusability**: Create shared utility functions and components
- ✅ **Testability**: Set up testing framework with unit tests
- ✅ **Maintainability**: Improve code organization and structure

## Key Changes

### 1. Component Breakdown

#### Dashboard Components

- **Before**: Single `manuscript-dashboard.tsx` file (2700+ lines)
- **After**: Modular component structure:
  - `ManuscriptDashboardRefactored` - Main orchestrator component
  - `ManuscriptFilters` - Search and filtering UI
  - `ManuscriptTableHeader` - Table header with sorting
  - `ManuscriptTableRow` - Individual manuscript row
  - `ColumnSettings` - Column visibility controls

#### Detail Components

- **Before**: Single `manuscript-detail.tsx` file (3500+ lines)
- **After**: Modular component structure:
  - `ManuscriptDetailRefactored` - Main detail view orchestrator
  - `ManuscriptHeader` - Header with manuscript info
  - `FigureViewer` - Figure display and navigation

### 2. Custom Hooks

#### Dashboard Hooks

- `useManuscriptState` - State management for dashboard
- `useManuscriptOperations` - Business logic operations

#### Detail Hooks

- `useManuscriptDetailState` - State management for detail view
- `useManuscriptDetailApi` - API operations for detail view

### 3. Type System

Created comprehensive TypeScript interfaces:

- `types/manuscript.ts` - Core manuscript data types
- `types/manuscript-detail.ts` - Detail view specific types

### 4. Utility Functions

Organized utility functions by concern:

- `lib/utils/manuscript-utils.ts` - Filtering, sorting, and data processing
- `lib/utils/date-utils.ts` - Date formatting and calculations
- `lib/utils/validation-utils.ts` - Data validation functions
- `lib/utils/sort-utils.ts` - Generic sorting utilities

### 5. Shared Components

Created reusable components:

- `LoadingSpinner` - Consistent loading indicator
- `ErrorBoundary` - Error handling wrapper

### 6. Testing Framework

Set up comprehensive testing with:

- Jest configuration
- React Testing Library
- Unit tests for hooks, components, and utilities
- Mocking for Next.js and NextAuth

## File Structure

```
components/
├── manuscript/
│   ├── manuscript-dashboard-refactored.tsx
│   ├── manuscript-detail-refactored.tsx
│   ├── manuscript-filters.tsx
│   ├── manuscript-table-header.tsx
│   ├── manuscript-table-row.tsx
│   ├── column-settings.tsx
│   ├── figure-viewer.tsx
│   └── manuscript-header.tsx
├── shared/
│   ├── loading-spinner.tsx
│   └── error-boundary.tsx
└── index.ts

hooks/
├── useManuscriptState.ts
├── useManuscriptOperations.ts
├── useManuscriptDetailState.ts
└── useManuscriptDetailApi.ts

types/
├── manuscript.ts
└── manuscript-detail.ts

lib/
├── utils/
│   ├── manuscript-utils.ts
│   ├── date-utils.ts
│   ├── validation-utils.ts
│   └── sort-utils.ts
├── mock-manuscript-data.ts
└── mock-manuscript-details.ts

__tests__/
├── hooks/
├── components/
└── lib/
```

## Benefits Achieved

### 1. **Maintainability**

- Components are now focused on single responsibilities
- Business logic is separated from UI logic
- Code is easier to understand and modify

### 2. **Reusability**

- Utility functions can be reused across components
- Shared components reduce code duplication
- Custom hooks encapsulate reusable stateful logic

### 3. **Testability**

- Individual components can be tested in isolation
- Business logic in hooks can be unit tested
- Utility functions have comprehensive test coverage

### 4. **Type Safety**

- Comprehensive TypeScript interfaces prevent runtime errors
- IDE provides better autocomplete and error detection
- Refactoring is safer with compile-time checks

### 5. **Performance**

- Smaller components enable better React optimization
- Memoization opportunities are clearer
- Bundle splitting potential for larger applications

### 6. **Developer Experience**

- Faster development with better code organization
- Easier onboarding for new developers
- Clear separation of concerns

## Migration Guide

### Using Refactored Components

```tsx
// Instead of the original component
import ManuscriptDashboard from "@/components/manuscript-dashboard";

// Use the refactored version
import { ManuscriptDashboardRefactored } from "@/components/manuscript/manuscript-dashboard-refactored";

// Or use the centralized export
import { ManuscriptDashboardRefactored } from "@/components";
```

### Using Custom Hooks

```tsx
import { useManuscriptState, useManuscriptOperations } from "@/hooks";

function MyComponent() {
  const { state, updateFilter, updateSort } = useManuscriptState();
  const { toggleOnHoldStatus, changePriority } = useManuscriptOperations({
    manuscripts: state.manuscripts,
    setManuscripts: state.setManuscripts,
    // ... other props
  });

  // Use state and operations
}
```

## Testing

Run tests with:

```bash
npm test                    # Run all tests
npm test -- --watch        # Run tests in watch mode
npm test -- --coverage     # Run tests with coverage report
```

## Legacy Files

The original files are preserved as legacy files with clear comments:

- `components/manuscript-dashboard.tsx` - Legacy dashboard
- `components/manuscript-detail.tsx` - Legacy detail view

These files include the comment:

```tsx
// LEGACY FILE - Use components/manuscript/[component]-refactored.tsx instead
// This file is kept for reference only
```

## Best Practices Implemented

1. **Single Responsibility Principle**: Each component has a clear, focused purpose
2. **DRY (Don't Repeat Yourself)**: Common logic extracted into reusable utilities
3. **Composition over Inheritance**: Components compose smaller components
4. **Custom Hooks**: Stateful logic is reusable and testable
5. **TypeScript Best Practices**: Comprehensive typing with proper interfaces
6. **Testing Pyramid**: Unit tests for core logic, integration tests for components

## Future Considerations

1. **Code Splitting**: Consider lazy loading for large feature areas
2. **State Management**: Evaluate need for Redux/Zustand for complex state
3. **Performance Optimization**: Add React.memo and useMemo where beneficial
4. **Accessibility**: Enhance ARIA labels and keyboard navigation
5. **Internationalization**: Prepare for multi-language support
6. **Documentation**: Add JSDoc comments for complex functions

## Conclusion

This refactoring significantly improves the codebase's maintainability, testability, and developer experience while preserving all existing functionality. The modular structure provides a solid foundation for future development and feature additions.

The refactored code follows React and TypeScript best practices, making it easier for the team to collaborate and maintain the application long-term.
