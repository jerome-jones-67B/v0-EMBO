# Technical Documentation - Data4Rev Flow

Comprehensive technical reference for architecture, design decisions, and implementation details.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Choices](#technology-choices)
3. [Project Structure](#project-structure)
4. [Key Components](#key-components)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Type System](#type-system)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimizations](#performance-optimizations)
10. [Development Workflow](#development-workflow)

---

## Architecture Overview

### Design Philosophy

The application follows a **component-based architecture** with clear separation of concerns:

- **Presentation Layer**: React components for UI rendering
- **Business Logic Layer**: Custom hooks for stateful logic
- **Data Layer**: API client and transformers for backend communication
- **Utility Layer**: Pure functions for common operations

### Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Next.js App Router               │
│  (Server Components + Client Components)    │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          React Components                   │
│  ┌──────────────────────────────────────┐  │
│  │  Manuscript Dashboard                │  │
│  │  ├─ Figure List                      │  │
│  │  ├─ Figure Viewer                    │  │
│  │  ├─ Source Files Treeview            │  │
│  │  └─ Manuscript Overview Tabs         │  │
│  └──────────────────────────────────────┘  │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          Custom React Hooks                 │
│  ┌──────────────────────────────────────┐  │
│  │  useManuscriptDetailApi              │  │
│  │  useApiDataLoader                    │  │
│  │  useManuscriptState                  │  │
│  │  useManuscriptOperations             │  │
│  └──────────────────────────────────────┘  │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          API Client Layer                   │
│  ┌──────────────────────────────────────┐  │
│  │  api-client.ts                       │  │
│  │  ├─ manuscripts.*                    │  │
│  │  ├─ sourceData.*                     │  │
│  │  ├─ links.*                          │  │
│  │  └─ checkResults.*                   │  │
│  └──────────────────────────────────────┘  │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          Data Transformers                  │
│  (API response → UI data format)            │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          Data4Rev REST API                  │
│  (Backend service with OpenAPI spec)        │
└─────────────────────────────────────────────┘
```

---

## Technology Choices

### Core Technologies

#### Next.js 14 (App Router)

**Why Next.js?**

- Server-side rendering (SSR) capabilities
- File-based routing with App Router
- API routes for backend functionality
- Built-in optimization (image, font, script)
- Excellent TypeScript support
- Strong ecosystem and community

**App Router Benefits**

- React Server Components for reduced bundle size
- Streaming and suspense support
- Improved data fetching patterns
- Built-in loading and error states

#### TypeScript 5.3

**Why TypeScript?**

- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Self-documenting code with type annotations
- Easier refactoring with compile-time checks
- Essential for large-scale applications

**Configuration**

- Strict mode enabled for maximum type safety
- Path aliases (`@/` prefix) for clean imports
- Incremental compilation for faster builds

#### Tailwind CSS 3.4

**Why Tailwind?**

- Utility-first approach for rapid development
- Consistent design system
- No CSS naming conventions needed
- Excellent tree-shaking (unused styles removed)
- Easy responsive design with breakpoint utilities

**Customization**

- Extended color palette for brand colors
- Custom animations and transitions
- Dark mode support (class-based)

#### Radix UI

**Why Radix UI?**

- Unstyled, accessible components
- Full keyboard navigation
- ARIA attributes built-in
- Composable primitives
- No styling conflicts with Tailwind

**Used Components**

- Dialog, DropdownMenu, Select, Checkbox
- Accordion, Collapsible, Tabs
- Tooltip, HoverCard, Popover

### Supporting Libraries

#### React DnD Kit

**Why @dnd-kit?**

- Modern drag-and-drop for React
- Excellent touch support
- Keyboard accessibility
- Sortable list implementation
- Lower bundle size than react-dnd

**Usage**

- Panel reordering in figure editor
- File mapping in source data tree

#### React Hook Form

**Why React Hook Form?**

- Minimal re-renders
- Excellent TypeScript support
- Built-in validation
- Small bundle size (~8kb)

**Usage**

- External link forms
- Check override dialogs
- Manuscript filtering

#### Zod

**Why Zod?**

- TypeScript-first schema validation
- Excellent error messages
- Type inference from schemas
- Integration with React Hook Form

**Usage**

- Form validation
- API response validation
- Environment variable validation

---

## Project Structure

### Directory Layout

```
ui/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (providers, fonts)
│   ├── page.tsx                 # Home page (dashboard)
│   └── globals.css              # Global styles and Tailwind imports
│
├── components/                   # React components
│   ├── manuscript/              # Manuscript-specific components
│   │   ├── figure-list.tsx             # Main figure display and management
│   │   ├── figure-viewer.tsx           # Interactive figure viewer
│   │   ├── source-files-treeview.tsx   # Hierarchical file tree
│   │   ├── manuscript-overview-tabs.tsx # Tabs for manuscript metadata
│   │   ├── checks-table.tsx            # Quality checks table
│   │   ├── panel-editor.tsx            # Add/edit panels
│   │   ├── link-dialog.tsx             # External link management
│   │   └── ...                         # Additional manuscript components
│   │
│   ├── ui/                      # Reusable UI components (Radix-based)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   └── ...                  # 50+ UI primitives
│   │
│   ├── manuscript-dashboard.tsx # Main dashboard component
│   ├── auth-guard.tsx          # Authentication wrapper
│   └── session-provider.tsx    # NextAuth session provider
│
├── hooks/                       # Custom React hooks
│   ├── useApiDataLoader.ts              # Load manuscript list
│   ├── useManuscriptDetailApi.ts        # Load manuscript details
│   ├── useManuscriptState.ts            # Dashboard state management
│   ├── useManuscriptOperations.ts       # Manuscript CRUD operations
│   └── use-toast.ts                     # Toast notifications
│
├── lib/                         # Utilities and libraries
│   ├── api-client.ts           # API client with all endpoints
│   ├── types.ts                # TypeScript type definitions
│   ├── data-transformer.ts     # API → UI data transformation
│   ├── data-service.ts         # Data fetching service layer
│   ├── status-mapping.ts       # Manuscript status mappings
│   ├── image-utils.ts          # Image processing utilities
│   ├── text-utils.ts           # Text manipulation utilities
│   ├── config.ts               # App configuration
│   ├── logger.ts               # Logging utility
│   └── utils/                  # Additional utilities
│       ├── figure-utils.ts     # Figure-related helpers
│       ├── tree-utils.ts       # File tree operations
│       └── ...
│
├── types/                       # Global TypeScript definitions
│   ├── manuscript.ts           # Manuscript types
│   ├── manuscript-detail.ts    # Detailed manuscript types
│   ├── dashboard.ts            # Dashboard-specific types
│   └── jest.d.ts               # Jest type extensions
│
├── __tests__/                  # Test suites
│   ├── components/             # Component tests
│   ├── hooks/                  # Hook tests
│   └── lib/                    # Utility tests
│
├── public/                     # Static assets
│   ├── images/                # Image files
│   └── ...
│
├── scripts/                    # Build and deployment scripts
│
└── Configuration files
    ├── next.config.mjs         # Next.js configuration
    ├── tsconfig.json           # TypeScript configuration
    ├── tailwind.config.ts      # Tailwind configuration
    ├── jest.config.js          # Jest configuration
    ├── jest.setup.js           # Jest setup file
    └── .env.local              # Environment variables (local)
```

---

## Key Components

### 1. Manuscript Dashboard (`manuscript-dashboard.tsx`)

**Purpose**: Main landing page displaying all manuscripts with filtering, sorting, and pagination.

**Key Features**:

- Data table with customizable columns
- Multi-criteria filtering (status, date range, search)
- Sorting by any column
- Row selection for batch operations
- Export functionality
- Responsive layout

**State Management**:

```typescript
const [manuscripts, setManuscripts] = useState<Manuscript[]>([])
const [filters, setFilters] = useState<FilterState>({...})
const [sortField, setSortField] = useState<string>('received')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
```

**Data Flow**:

1. `useApiDataLoader` hook fetches manuscript list
2. Filters and sorts applied in component
3. Table renders with current page of data
4. User interactions update state
5. State changes trigger re-fetch or re-render

### 2. Figure List (`figure-list.tsx`)

**Purpose**: Display and manage figures, panels, and source files for a manuscript.

**Key Features**:

- Lazy-loaded figure previews
- Expandable panel details with bounding boxes
- Source file assignment (manuscript/figure/panel levels)
- External link management
- Panel zoom with canvas extraction
- Collapsible sections for better UX

**Complex Logic**:

**File Assignment System**:

```typescript
const handleSourceFileSelection = async (sourceFile: ManuscriptFileDetails) => {
  const { targetType, targetId } = mappingTarget;

  if (targetType === "manuscript") {
    await api.sourceData.assignToManuscript(manuscriptId, sourceFile.id);
  } else if (targetType === "figure") {
    await api.sourceData.assignToFigure(manuscriptId, targetId, sourceFile.id);
  } else if (targetType === "panel") {
    const { figureId, panelId } = parsePanelId(targetId);
    await api.sourceData.assignToPanel(
      manuscriptId,
      figureId,
      panelId,
      sourceFile.id
    );
  }

  // Refresh data to show updated assignments
  refreshManuscriptData();
};
```

**Panel Bounding Box Rendering**:

```typescript
const renderPanelOverlay = (panel: Panel) => (
  <div
    style={{
      position: "absolute",
      left: `${panel.x1 * 100}%`,
      top: `${panel.y1 * 100}%`,
      width: `${(panel.x2 - panel.x1) * 100}%`,
      height: `${(panel.y2 - panel.y1) * 100}%`,
      border: "2px solid #3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
    }}
  >
    <span className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
      {panel.label}
    </span>
  </div>
);
```

### 3. Source Files Treeview (`source-files-treeview.tsx`)

**Purpose**: Hierarchical file browser with bulk mapping capabilities.

**Key Features**:

- Tree structure with expand/collapse
- ZIP file support (shows contents)
- Multi-select for bulk operations
- Drag-and-drop assignment
- Visual indicators for mapped files
- Left navigation panel integration

**Tree Structure Algorithm**:

```typescript
interface TreeNode {
  id: string;
  name: string;
  type: "file" | "folder" | "zip";
  path: string;
  children?: TreeNode[];
  file?: ManuscriptFileDetails;
}

const organizeFilesIntoTree = (files: ManuscriptFileDetails[]): TreeNode[] => {
  const root: TreeNode[] = [];
  const pathMap = new Map<string, TreeNode>();

  // Sort files by path depth
  const sorted = files.sort(
    (a, b) => a.name.split("/").length - b.name.split("/").length
  );

  for (const file of sorted) {
    const parts = file.name.split("/");
    let currentLevel = root;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let node = pathMap.get(currentPath);

      if (!node) {
        node = {
          id: currentPath,
          name: part,
          type: i === parts.length - 1 ? "file" : "folder",
          path: currentPath,
          children: i === parts.length - 1 ? undefined : [],
          file: i === parts.length - 1 ? file : undefined,
        };

        currentLevel.push(node);
        pathMap.set(currentPath, node);
      }

      if (node.children) {
        currentLevel = node.children;
      }
    }
  }

  return root;
};
```

### 4. Figure Viewer (`figure-viewer.tsx`)

**Purpose**: Interactive viewer for individual figures with panel selection and quality checks.

**Key Features**:

- Three-column layout (figure | panels | details)
- Interactive panel highlighting
- Bounding box overlay
- Quality check display per panel
- Navigation between figures
- Panel zoom functionality

**Panel Selection Logic**:

```typescript
const handlePanelClick = (panelId: number) => {
  setSelectedPanelId(panelId);

  // Update figure display to highlight selected panel
  const panel = currentFigure.panels.find((p) => p.id === panelId);
  if (panel) {
    // Scroll to panel in list
    panelListRef.current?.scrollToPanel(panelId);

    // Highlight bounding box
    setHighlightedPanel(panel);

    // Load panel details
    loadPanelDetails(panelId);
  }
};
```

---

## State Management

### Strategy

The application uses **local component state** with React hooks rather than a global state management library (Redux, Zustand, etc.).

**Rationale**:

- Simpler mental model
- Less boilerplate
- Better performance (only affected components re-render)
- Easier testing
- No over-fetching or stale data issues

### State Patterns

#### 1. Component-Local State

For UI-only state that doesn't need to be shared:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState("overview");
```

#### 2. Prop Drilling with Callbacks

For parent-child communication:

```typescript
// Parent
const [figures, setFigures] = useState<Figure[]>([]);

const handleFigureUpdate = (figureId: number, updates: Partial<Figure>) => {
  setFigures((prev) =>
    prev.map((fig) => (fig.id === figureId ? { ...fig, ...updates } : fig))
  );
};

// Child
<FigureList figures={figures} onUpdate={handleFigureUpdate} />;
```

#### 3. Custom Hooks for Shared Logic

For reusable stateful logic:

```typescript
const useManuscriptDetail = (manuscriptId: string) => {
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.manuscripts.getById(manuscriptId);
        setManuscript(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [manuscriptId]);

  return { manuscript, loading, error, refetch: fetchData };
};
```

#### 4. Refs for Performance-Critical State

For values that change frequently but don't need to trigger re-renders:

```typescript
const scrollPositionRef = useRef(0);
const lastUpdateTimeRef = useRef(Date.now());

// Update without re-render
scrollPositionRef.current = window.scrollY;
```

### State Update Patterns

#### Immutable Updates

```typescript
// ❌ Don't mutate directly
figures[0].title = "New Title";
setFigures(figures);

// ✅ Create new array/object
setFigures((prev) =>
  prev.map((fig, idx) => (idx === 0 ? { ...fig, title: "New Title" } : fig))
);
```

#### Optimistic Updates

```typescript
const handleDeletePanel = async (panelId: number) => {
  // Optimistically update UI
  setFigures((prev) =>
    prev.map((fig) => ({
      ...fig,
      panels: fig.panels.filter((p) => p.id !== panelId),
    }))
  );

  try {
    await api.panels.delete(manuscriptId, figureId, panelId);
    toast.success("Panel deleted");
  } catch (error) {
    // Revert on error
    await refetchFigures();
    toast.error("Failed to delete panel");
  }
};
```

---

## API Integration

### API Client Architecture

The API client (`lib/api-client.ts`) provides a centralized interface for all backend communication.

**Design Principles**:

- Type-safe endpoints with TypeScript
- Consistent error handling
- Request/response transformation
- Authentication token injection
- Retry logic for transient failures

### Client Structure

```typescript
export const api = {
  manuscripts: {
    list: async (params: ListParams) => ApiResponse<ManuscriptsPage>,
    getById: async (id: string) => ApiResponse<ManuscriptDetails>,
    update: async (id: string, data: Partial<Manuscript>) => ApiResponse<void>,
  },

  figures: {
    list: async (manuscriptId: string) => ApiResponse<Figure[]>,
    update: async (
      manuscriptId: string,
      figureId: number,
      data: Partial<Figure>
    ) => ApiResponse<void>,
    updatePanels: async (
      manuscriptId: string,
      figureId: number,
      panels: Panel[]
    ) => ApiResponse<void>,
  },

  panels: {
    create: async (manuscriptId: string, figureId: number, data: PanelCreate) =>
      ApiResponse<Panel>,
    update: async (
      manuscriptId: string,
      figureId: number,
      panelId: number,
      data: Partial<Panel>
    ) => ApiResponse<void>,
    delete: async (manuscriptId: string, figureId: number, panelId: number) =>
      ApiResponse<void>,
  },

  sourceData: {
    list: async (manuscriptId: string) => ApiResponse<SourceFile[]>,
    assignToManuscript: async (manuscriptId: string, fileId: number) =>
      ApiResponse<SourceDataMapping>,
    assignToFigure: async (
      manuscriptId: string,
      figureId: number,
      fileId: number
    ) => ApiResponse<SourceDataMapping>,
    assignToPanel: async (
      manuscriptId: string,
      figureId: number,
      panelId: number,
      fileId: number
    ) => ApiResponse<SourceDataMapping>,
    deleteFromManuscript: async (manuscriptId: string, sourceDataId: number) =>
      ApiResponse<void>,
    deleteFromFigure: async (
      manuscriptId: string,
      figureId: number,
      sourceDataId: number
    ) => ApiResponse<void>,
    deleteFromPanel: async (
      manuscriptId: string,
      figureId: number,
      panelId: number,
      sourceDataId: number
    ) => ApiResponse<void>,
  },

  links: {
    create: async (manuscriptId: string, data: LinkCreate) => ApiResponse<Link>,
    update: async (manuscriptId: string, linkId: number, data: Partial<Link>) =>
      ApiResponse<void>,
    delete: async (manuscriptId: string, linkId: number) => ApiResponse<void>,
  },

  checkResults: {
    override: async (
      manuscriptId: string,
      checkId: number,
      data: CheckOverride
    ) => ApiResponse<void>,
    create: async (manuscriptId: string, data: CheckCreate) =>
      ApiResponse<CheckResult>,
  },
};
```

### Request/Response Flow

```typescript
// 1. Component calls API
const fetchManuscript = async () => {
  try {
    const response = await api.manuscripts.getById(manuscriptId);

    // 2. API client adds auth token
    // 3. Makes fetch request
    // 4. Handles HTTP errors
    // 5. Transforms response

    // 6. Component receives typed data
    setManuscript(response.data);
  } catch (error) {
    // 7. Error handling in component
    setError(error.message);
  }
};
```

### Data Transformation

API responses are transformed to match UI expectations:

```typescript
export const transformApiManuscriptToUI = (
  apiData: ApiManuscript
): Manuscript => {
  return {
    id: apiData.id,
    msid: apiData.msid,
    title: apiData.title,
    authors: apiData.authors,
    received: apiData.received_at,
    status: mapStatus(apiData.status),
    displayStatus: getDisplayStatus(apiData.status),
    figureCount: apiData.figures?.length || 0,
    qcStatus: computeQCStatus(apiData.check_results),
    // ... additional mappings
  };
};
```

### Error Handling

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) {
    // Known API error
    logger.error("API Error:", error.statusCode, error.message);
    throw error;
  } else if (error instanceof Error) {
    // Network or other error
    logger.error("Network Error:", error.message);
    throw new ApiError("Network request failed", 0, error);
  } else {
    // Unknown error
    logger.error("Unknown Error:", error);
    throw new ApiError("An unexpected error occurred", 0);
  }
};
```

---

## Type System

### Type Hierarchy

```
Manuscript (UI type)
  ├─ ManuscriptDetails (API type)
  ├─ ManuscriptOverview (API type)
  └─ ManuscriptDetailData (Transformed type)

Figure (UI type)
  ├─ FigureDetails (API type)
  └─ Panel[]
      └─ PanelDetails (API type)

SourceFile
  ├─ ManuscriptFileDetails (API type)
  └─ SourceDataMapping (API type)

Link
  ├─ LinkDetails (API type)
  └─ LinkCreate (Request type)

CheckResult
  ├─ CheckResultDetails (API type)
  └─ CheckOverride (Request type)
```

### Key Type Definitions

```typescript
// lib/types.ts

export interface Manuscript {
  id: string;
  msid: string;
  title: string;
  authors: string;
  received: string;
  status: string;
  displayStatus: string;
  doi?: string;
  accessionNumber?: string;
  figureCount: number;
  qcStatus: "pass" | "warning" | "fail";
  notes?: string;
  lastModified: string;
}

export interface Figure {
  id: number;
  label: string;
  title: string;
  caption: string;
  image_file_id: number;
  sort_order: number;
  panels: Panel[];
  source_data: SourceDataDetails[];
  links: LinkDetails[];
  check_results: CheckResultDetails[];
}

export interface Panel {
  id: number;
  label: string;
  caption: string;
  x1: number | null; // Bounding box coordinates (0-1)
  y1: number | null;
  x2: number | null;
  y2: number | null;
  confidence: number | null;
  sort_order: number;
  links: LinkDetails[];
  source_data: SourceDataDetails[];
  check_results: CheckResultDetails[];
}

export interface ManuscriptFileDetails {
  id: number;
  name: string;
  size?: number;
  content_type?: string;
  source: "uploaded" | "extracted";
  assigned_to: FileAssignment[];
}

export interface FileAssignment {
  figure: { id: number; label: string };
  panel: { id: number; label: string };
}

export interface LinkDetails {
  id: number;
  name: string;
  link_type: "structured" | "freeform";
  database?: string; // For structured links
  identifier?: string;
  url: string;
  description?: string;
}

export interface CheckResultDetails {
  id: number;
  check_name: string;
  status: "error" | "warning" | "info";
  severity: number;
  message: string;
  details?: string;
  is_overridden: boolean;
  override_reason?: string;
}
```

### Type Guards

```typescript
export const isStructuredLink = (link: LinkDetails): link is StructuredLink => {
  return (
    link.link_type === "structured" && !!link.database && !!link.identifier
  );
};

export const isFreeformLink = (link: LinkDetails): link is FreeformLink => {
  return link.link_type === "freeform" && !!link.url;
};

export const hasCheckResults = (
  item: Figure | Panel
): item is (Figure | Panel) & { check_results: CheckResultDetails[] } => {
  return Array.isArray(item.check_results) && item.check_results.length > 0;
};
```

---

## Testing Strategy

### Test Structure

```
__tests__/
├── components/
│   ├── manuscript/
│   │   ├── figure-list.test.tsx
│   │   ├── figure-viewer.test.tsx
│   │   └── source-files-treeview.test.tsx
│   └── ui/
│       └── button.test.tsx
├── hooks/
│   ├── useManuscriptDetailApi.test.ts
│   └── useManuscriptState.test.ts
└── lib/
    ├── data-transformer.test.ts
    ├── utils/
    │   ├── figure-utils.test.ts
    │   └── tree-utils.test.ts
    └── api-client.test.ts
```

### Testing Approach

#### 1. Component Tests

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FigureList } from "@/components/manuscript/figure-list";

describe("FigureList", () => {
  it("renders figures with panels", () => {
    const mockFigures = [
      { id: 1, label: "Figure 1", panels: [{ id: 1, label: "A" }] },
    ];

    render(<FigureList figures={mockFigures} manuscriptId="123" />);

    expect(screen.getByText("Figure 1")).toBeInTheDocument();
    expect(screen.getByText("Panel A")).toBeInTheDocument();
  });

  it("handles panel expansion", async () => {
    const mockFigures = [
      { id: 1, label: "Figure 1", panels: [{ id: 1, label: "A" }] },
    ];

    render(<FigureList figures={mockFigures} manuscriptId="123" />);

    const expandButton = screen.getByRole("button", { name: /expand/i });
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText(/panel details/i)).toBeInTheDocument();
    });
  });
});
```

#### 2. Hook Tests

```typescript
import { renderHook, act } from "@testing-library/react";
import { useManuscriptDetailApi } from "@/hooks/useManuscriptDetailApi";

jest.mock("@/lib/api-client");

describe("useManuscriptDetailApi", () => {
  it("fetches manuscript data on mount", async () => {
    const mockData = { id: "123", title: "Test Manuscript" };
    api.manuscripts.getById.mockResolvedValue(mockData);

    const { result } = renderHook(() => useManuscriptDetailApi("123"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.manuscript).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

#### 3. Utility Tests

```typescript
import { organizeFilesIntoTree } from "@/lib/utils/tree-utils";

describe("organizeFilesIntoTree", () => {
  it("creates nested structure from flat file list", () => {
    const files = [
      { id: 1, name: "folder/file1.txt" },
      { id: 2, name: "folder/subfolder/file2.txt" },
      { id: 3, name: "root.txt" },
    ];

    const tree = organizeFilesIntoTree(files);

    expect(tree).toHaveLength(2); // folder and root.txt
    expect(tree[0].children).toHaveLength(2); // file1.txt and subfolder
    expect(tree[0].children[1].children).toHaveLength(1); // file2.txt
  });
});
```

### Mocking Strategy

#### API Mocks

```typescript
// __mocks__/api-client.ts
export const api = {
  manuscripts: {
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
  },
  sourceData: {
    assignToManuscript: jest.fn(),
    assignToFigure: jest.fn(),
    assignToPanel: jest.fn(),
  },
  // ... other endpoints
};
```

#### Component Mocks

```typescript
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
}));
```

---

## Performance Optimizations

### 1. Lazy Loading

#### Image Lazy Loading

```typescript
const useIntersectionObserver = (ref: RefObject<HTMLElement>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
};

// Usage
const FigureImage = ({ src }) => {
  const ref = useRef(null);
  const isVisible = useIntersectionObserver(ref);

  return (
    <div ref={ref}>
      {isVisible ? <img src={src} alt="Figure" /> : <Skeleton />}
    </div>
  );
};
```

### 2. Memoization

#### React.memo for Components

```typescript
export const FigureCard = React.memo(
  ({ figure, onUpdate }) => {
    return (
      <Card>
        <CardTitle>{figure.label}</CardTitle>
        <CardContent>{figure.caption}</CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if figure data changed
    return (
      prevProps.figure.id === nextProps.figure.id &&
      prevProps.figure.caption === nextProps.figure.caption
    );
  }
);
```

#### useMemo for Expensive Calculations

```typescript
const filteredAndSortedManuscripts = useMemo(() => {
  return manuscripts
    .filter((m) => matchesFilters(m, filters))
    .sort((a, b) => compareManuscripts(a, b, sortField, sortOrder));
}, [manuscripts, filters, sortField, sortOrder]);
```

#### useCallback for Function Props

```typescript
const handlePanelUpdate = useCallback(
  (panelId: number, updates: Partial<Panel>) => {
    setFigures((prev) =>
      prev.map((fig) => ({
        ...fig,
        panels: fig.panels.map((panel) =>
          panel.id === panelId ? { ...panel, ...updates } : panel
        ),
      }))
    );
  },
  []
); // No dependencies = stable reference
```

### 3. Code Splitting

#### Dynamic Imports

```typescript
import dynamic from "next/dynamic";

const FigureViewer = dynamic(
  () => import("@/components/manuscript/figure-viewer"),
  {
    loading: () => <Skeleton />,
    ssr: false, // Client-side only
  }
);

// Usage
{
  showViewer && <FigureViewer {...props} />;
}
```

### 4. Debouncing and Throttling

```typescript
const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Usage in search
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebouncedValue(searchTerm, 300);

useEffect(() => {
  // Only triggers after user stops typing for 300ms
  performSearch(debouncedSearch);
}, [debouncedSearch]);
```

---

## Development Workflow

### Environment Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Run tests in watch mode**
   ```bash
   npm run test:watch
   ```

### Git Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes with atomic commits**

   ```bash
   git add <files>
   git commit -m "feat: add panel zoom functionality"
   ```

3. **Run checks before pushing**

   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality Checks

#### Pre-commit Checklist

- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] No console.log statements left in code
- [ ] Updated tests for new functionality
- [ ] Added JSDoc comments for public functions

#### Code Review Checklist

- [ ] Follows existing code patterns
- [ ] Has appropriate error handling
- [ ] Includes unit tests
- [ ] Optimized for performance
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Responsive design
- [ ] No hardcoded values (use constants)
- [ ] Proper TypeScript types (no `any` unless necessary)

### Debugging Tips

#### React DevTools

```bash
# Install React DevTools browser extension
# Inspect component tree, props, state, and hooks
```

#### API Request Debugging

```typescript
// Enable detailed logging in api-client.ts
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("Request:", method, url, data);
  console.log("Response:", response.status, response.data);
}
```

#### Performance Profiling

```typescript
import { Profiler } from "react";

const onRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
};

<Profiler id="FigureList" onRender={onRenderCallback}>
  <FigureList {...props} />
</Profiler>;
```

---

## Deployment

### Vercel Deployment (Production)

1. **Connect repository to Vercel**
2. **Configure build settings**

   - Build Command: `npm run build`
   - Output Directory: `out`
   - Install Command: `npm install`

3. **Set environment variables** in Vercel dashboard
4. **Deploy**: Automatic on push to `main` branch

### Static Export

```bash
# Build static site
npm run build

# Output in 'out' directory
# Deploy to any static host (Nginx, S3, etc.)
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_BASE_URL=https://api.production.com/v1
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXTAUTH_URL=https://yourapp.com
NEXTAUTH_SECRET=<strong_secret>
```

---

## Conclusion

This technical documentation provides a comprehensive overview of the Data4Rev Flow application architecture, design decisions, and implementation details. For specific implementation examples, refer to the codebase. For project status and features, see STATUS.md. For setup instructions, see README.md.

**Key Takeaways**:

- Component-based architecture with React and Next.js
- Type-safe with TypeScript throughout
- Centralized API client with transformation layer
- Local state management with custom hooks
- Comprehensive testing with Jest and React Testing Library
- Performance optimized with lazy loading and memoization
- Production-ready with CI/CD pipeline

For questions or contributions, refer to the contributing guidelines in README.md.
