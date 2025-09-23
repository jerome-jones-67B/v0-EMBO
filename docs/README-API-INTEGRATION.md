# API Integration Guide

This guide explains how to switch from mock data to your real API backend.

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false  # Set to false to use real API
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
```

### 2. API Endpoints Expected

Your backend should provide these endpoints:

```
GET    /api/manuscripts              # List manuscripts with pagination/filters
GET    /api/manuscripts/{id}         # Get specific manuscript
POST   /api/manuscripts              # Create new manuscript
PUT    /api/manuscripts/{id}         # Update manuscript
DELETE /api/manuscripts/{id}         # Delete manuscript

GET    /api/figures                  # List figures
GET    /api/figures/{id}             # Get specific figure
POST   /api/figures                  # Create figure
PUT    /api/figures/{id}             # Update figure

GET    /api/linked-data              # List linked data entries
POST   /api/linked-data              # Create linked data entry

GET    /api/source-data              # List source data files
POST   /api/source-data              # Upload source data file

GET    /api/authors                  # List authors
POST   /api/authors                  # Create author

GET    /api/comments?manuscriptId={id} # Get comments for manuscript
POST   /api/comments                 # Create comment

GET    /api/tasks                    # List tasks with filters
POST   /api/tasks                    # Create task
PUT    /api/tasks/{id}               # Update task

GET    /api/notifications?userId={id} # Get user notifications
PATCH  /api/notifications/{id}       # Mark notification as read
```

### 3. Expected API Response Format

All endpoints should return responses in this format:

#### Single Item Response
```typescript
{
  "data": { /* your data object */ },
  "success": true,
  "message": "Success"
}
```

#### Paginated List Response
```typescript
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "success": true,
  "message": "Success"
}
```

#### Error Response
```typescript
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## 📋 Data Types

### Manuscript Object
```typescript
{
  id: string;              // e.g., "EMBO-2024-001"
  title: string;
  authors: string[];       // Array of author names
  received: string;        // ISO date string
  lastModified: string;    // ISO date string
  status: string;          // "In progress", "On hold", etc.
  assignedTo: string | null;
  priority: string;        // "low", "medium", "high", "urgent"
  figureCount: number;
  qcStatus: string;        // "needs-validation", "validated"
  abstract?: string;
  keywords?: string[];
  journal?: string;
  submissionType?: string;
  wordCount?: number;
  collaborators?: string[];
}
```

### Figure Object
```typescript
{
  id: string;
  title: string;
  legend: string;
  linkedData: LinkedDataEntry[];
  panels: Panel[];
  qcChecks: QCCheck[];
}
```

## 🔧 How to Switch Components

### Before (using mock data):
```typescript
import { mockManuscripts } from '@/lib/mock';

export function MyComponent() {
  const [manuscripts] = useState(mockManuscripts);
  // ... component logic
}
```

### After (using API):
```typescript
import { useManuscripts } from '@/hooks/use-data';

export function MyComponent() {
  const { manuscripts, loading, error, refetch } = useManuscripts();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // ... component logic with manuscripts data
}
```

## 🎯 Available Hooks

### Data Fetching Hooks
- `useManuscripts(params?)` - Get paginated manuscripts with filters
- `useManuscript(id)` - Get single manuscript by ID
- `useFigures(params?)` - Get figures with optional manuscript filter
- `useFigure(id)` - Get single figure by ID
- `useLinkedData(params?)` - Get linked data entries
- `useComments(manuscriptId)` - Get comments for a manuscript
- `useTasks(params?)` - Get tasks with filters
- `useNotifications(userId)` - Get user notifications
- `useSearch(query)` - Search manuscripts
- `useStatistics()` - Get dashboard statistics

### Action Hooks
- `useManuscriptActions()` - Create/update manuscripts
  - `createManuscript(data)`
  - `updateManuscript(id, data)`

### Hook Parameters

Most hooks accept optional parameters for filtering and pagination:

```typescript
const { manuscripts, pagination, loading, error } = useManuscripts({
  page: 1,
  limit: 20,
  status: "In progress",
  priority: "high",
  assignedTo: "Dr. Sarah Wilson"
});
```

## 🔄 Switching Between Mock and Real Data

You can toggle between mock data and real API calls:

```typescript
import { dataService } from '@/lib/data-service';

// Switch to mock data (useful for development/testing)
dataService.setUseMockData(true);

// Switch to real API
dataService.setUseMockData(false);
```

Or use environment variables:
```env
NEXT_PUBLIC_USE_MOCK_DATA=true   # Use mock data
NEXT_PUBLIC_USE_MOCK_DATA=false  # Use real API
```

## 🛠️ Error Handling

The data service includes automatic retry logic and error handling:

```typescript
const { data, loading, error, refetch } = useManuscripts();

if (error) {
  return (
    <div className="error-state">
      <p>Error: {error}</p>
      <Button onClick={refetch}>Try Again</Button>
    </div>
  );
}
```

## 📝 File Uploads

For file uploads (source data), use FormData:

```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('manuscriptId', manuscriptId);
  formData.append('description', 'File description');
  
  try {
    const response = await api.sourceData.upload(formData);
    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🔒 Authentication

If your API requires authentication, you can extend the API client:

```typescript
// In lib/api-client.ts, add headers:
const response = await fetch(url, {
  ...options,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`, // Add your auth logic
    ...options.headers,
  },
});
```

## 🚀 Going Live

1. Set up your backend API endpoints
2. Update your environment variables
3. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
4. Test all functionality with real data
5. Deploy!

The system will automatically switch from mock data to your real API without any code changes needed in your components.