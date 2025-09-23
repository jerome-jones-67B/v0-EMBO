# Data4Rev API Integration Guide

Your EMBO application is now configured to work with the [Data4Rev API](https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/openapi.json).

## 🔧 Configuration

### Environment Setup

Your `.env.local` file is configured with:

```env
# Data4Rev API Configuration
NEXT_PUBLIC_API_BASE_URL=https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=false

# You'll need to add authentication
NEXT_PUBLIC_AUTH_TOKEN=your_bearer_token_here
```

### Authentication

The Data4Rev API requires Bearer token authentication. You can:

1. **Set the token in environment variables:**
   ```env
   NEXT_PUBLIC_AUTH_TOKEN=your_actual_token_here
   ```

2. **Store it in localStorage (for development):**
   ```javascript
   localStorage.setItem('auth_token', 'your_token_here');
   ```

## 📊 Data Mapping

The system automatically transforms Data4Rev API responses to match your UI expectations:

### Manuscript Mapping

| Your UI Field | Data4Rev API Field | Transformation |
|---------------|-------------------|----------------|
| `id` | `msid` | Direct mapping |
| `title` | `title` | Direct mapping |
| `authors` | `authors` | String → Array conversion |
| `received` | `received_at` | Direct mapping |
| `status` | `status` | Direct mapping |
| `priority` | `status` | Derived from status |
| `qcStatus` | `status` | Derived from status |
| `figureCount` | `figures.length` | Calculated |
| `assignedTo` | N/A | Always `null` |

### Status Mappings

**Priority Mapping:**
- `submitted` → `medium`
- `in_progress` → `high`
- `needs_revision` → `high`
- `approved` → `low`
- `published` → `low`
- `rejected` → `low`

**QC Status Mapping:**
- `submitted` → `needs-validation`
- `in_progress` → `needs-validation`
- `needs_revision` → `needs-validation`
- `approved` → `validated`
- `published` → `validated`
- `rejected` → `validated`

## 🚀 Usage Examples

### Fetch Manuscripts
```typescript
import { useManuscripts } from '@/hooks/use-data';

function ManuscriptList() {
  const { manuscripts, loading, error, pagination } = useManuscripts({
    page: 1,
    limit: 20,
    status: 'in_progress'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {manuscripts.map(manuscript => (
        <div key={manuscript.id}>
          <h3>{manuscript.title}</h3>
          <p>Status: {manuscript.status}</p>
          <p>Priority: {manuscript.priority}</p>
          <p>Figures: {manuscript.figureCount}</p>
        </div>
      ))}
    </div>
  );
}
```

### Get Manuscript Details
```typescript
import { useManuscript } from '@/hooks/use-data';

function ManuscriptDetail({ manuscriptId }: { manuscriptId: string }) {
  const { data: manuscript, loading, error } = useManuscript(manuscriptId);

  if (loading) return <div>Loading manuscript...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!manuscript) return <div>Manuscript not found</div>;

  return (
    <div>
      <h1>{manuscript.title}</h1>
      <p>Authors: {manuscript.authors.join(', ')}</p>
      <p>Journal: {manuscript.journal}</p>
      <p>DOI: {manuscript.doi}</p>
      <p>Status: {manuscript.status}</p>
      <p>Received: {new Date(manuscript.received).toLocaleDateString()}</p>
    </div>
  );
}
```

### Direct API Calls
```typescript
import { api } from '@/lib/api-client';

// Get all manuscripts with pagination
const response = await api.manuscripts.getAll({
  page: 0, // 0-based pagination
  pagesize: 10,
  states: ['in_progress', 'submitted'],
  sort: 'received_at',
  ascending: false
});

// Get specific manuscript
const manuscript = await api.manuscripts.getById('EMBO-2024-001');

// Create a new figure
const newFigure = await api.figures.create('123', {
  label: 'Figure 1',
  caption: 'This is the figure caption',
  sort_order: 1,
  panels: [],
  links: [],
  source_data: []
});

// Upload a file
const formData = new FormData();
formData.append('file', file);
const uploadedFile = await api.files.upload(formData);

// Deposit manuscript
const depositionEvents = await api.manuscripts.deposit('123');
```

## 🔄 Switching Between Mock and Real Data

### During Development
```env
# Use mock data for development
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### For Production
```env
# Use real Data4Rev API
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_AUTH_TOKEN=your_production_token
```

### Programmatically
```typescript
import { dataService } from '@/lib/data-service';

// Switch to mock data (useful for testing)
dataService.setUseMockData(true);

// Switch back to real API
dataService.setUseMockData(false);
```

## 🛠️ Available Data4Rev API Endpoints

Based on the OpenAPI specification, your app now supports:

### Manuscripts
- ✅ `GET /manuscripts` - List manuscripts with filtering and pagination
- ✅ `GET /manuscripts/{id}` - Get manuscript details
- ✅ `GET /manuscripts/{id}/content` - Get manuscript text content
- ✅ `POST /manuscripts/{id}/deposit` - Deposit manuscript to repositories

### Figures
- ✅ `POST /manuscripts/{id}/figures` - Create figure
- ✅ `PUT /manuscripts/{id}/figures/{figureId}` - Update figure
- ✅ `DELETE /manuscripts/{id}/figures/{figureId}` - Delete figure

### Panels
- ✅ `POST /manuscripts/{id}/figures/{figureId}/panels` - Create panel
- ✅ `PUT /manuscripts/{id}/figures/{figureId}/panels/{panelId}` - Update panel
- ✅ `DELETE /manuscripts/{id}/figures/{figureId}/panels/{panelId}` - Delete panel

### Links
- ✅ `POST /manuscripts/{id}/links` - Create link
- ✅ `PUT /manuscripts/{id}/links/{linkId}` - Update link
- ✅ `DELETE /manuscripts/{id}/links/{linkId}` - Delete link

### Source Data
- ✅ `POST /manuscripts/{id}/source-data` - Create source data reference
- ✅ `DELETE /manuscripts/{id}/source-data/{sourceDataId}` - Delete source data

### Files
- ✅ `POST /files` - Upload file
- ✅ `GET /files/{id}` - Get file details
- ✅ `DELETE /files/{id}` - Delete file

### Check Results
- ✅ `GET /manuscripts/{id}/check-results` - Get QC check results

## 🔍 Testing the Integration

### Test API Connection
```typescript
// Test if API is accessible
import { api } from '@/lib/api-client';

async function testApiConnection() {
  try {
    const response = await api.manuscripts.getAll({ page: 0, pagesize: 1 });
    console.log('API Connection successful:', response);
    return true;
  } catch (error) {
    console.error('API Connection failed:', error);
    return false;
  }
}
```

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug_api', 'true');

// Your API calls will now log detailed information
```

## 🚨 Error Handling

The system includes comprehensive error handling:

```typescript
import { ApiError } from '@/lib/api-client';

try {
  const manuscripts = await api.manuscripts.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Handle authentication error
      console.log('Authentication failed - check your token');
    } else if (error.status === 403) {
      // Handle authorization error
      console.log('Access denied - insufficient permissions');
    } else {
      console.log(`API Error: ${error.message} (${error.status})`);
    }
  } else {
    console.log('Network or other error:', error);
  }
}
```

## 📈 Performance Considerations

- **Automatic Retries**: Failed requests are retried up to 3 times
- **Request Timeout**: Requests timeout after 10 seconds
- **Pagination**: Use appropriate page sizes (default: 20 items)
- **Caching**: Consider implementing React Query or SWR for caching

## 🔐 Security Notes

1. **Never commit tokens** to version control
2. **Use environment variables** for sensitive configuration
3. **Implement proper token refresh** if using JWT tokens
4. **Validate API responses** before using in your UI

Your EMBO application is now fully integrated with the Data4Rev API! 🎉