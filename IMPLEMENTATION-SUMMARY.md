# Status Mapping and API Integration Implementation

## ✅ Completed Features

### 1. Status Mapping System
- **Created `lib/status-mapping.ts`** with comprehensive status mapping
- **API Status → UI Display Mapping**:
  - `submitted` → `New submission` (ready-for-curation)
  - `in_progress` → `In Progress` (ready-for-curation)
  - `needs_revision` → `Needs Revision` (ready-for-curation)
  - `approved` → `Approved` (deposited-to-biostudies)
  - `published` → `Published` (deposited-to-biostudies)
  - `rejected` → `Rejected` (no-pipeline-results)

### 2. Enhanced Data Service
- **Updated `lib/data-service.ts`** to use proper status mapping
- **Added unmapped field detection** for highlighting
- **Integrated with status mapping utilities**

### 3. Dashboard Improvements
- **Updated `components/manuscript-dashboard.tsx`**:
  - Uses mapped `displayStatus` and `workflowState` for filtering
  - Highlights unmapped fields with yellow borders and warning icons
  - Shows proper status badges with correct variants
  - Maintains toggle functionality between mock and API data

### 4. Manuscript Detail View
- **Updated `components/manuscript-detail.tsx`**:
  - Added toggle switch for data source (Mock/API)
  - Fetches real API data when toggled to API mode
  - Transforms API data to match UI expectations
  - Highlights unmapped fields with warning badges
  - Shows loading states during API calls

### 5. Visual Indicators
- **Unmapped Field Highlighting**:
  - Yellow borders around unmapped status fields
  - Warning badges showing count of unmapped fields
  - Tooltips explaining unmapped field issues
  - Console logging for debugging

## 🔧 Technical Implementation

### Status Mapping
```typescript
// Example mapping
'submitted': {
  apiStatus: 'submitted',
  displayStatus: 'New submission',
  workflowState: 'ready-for-curation',
  priority: 'medium',
  qcStatus: 'needs-validation',
  badgeVariant: 'default',
  isMapped: true
}
```

### Unmapped Field Detection
- Automatically detects fields that don't map to API
- Highlights with visual indicators
- Provides user feedback about data inconsistencies

### Toggle Functionality
- **Dashboard**: Toggle between mock and API data sources
- **Manuscript Detail**: Independent toggle for detailed view
- **Real-time switching**: Immediate data source changes
- **Error handling**: Falls back to mock data on API errors

## 🎯 Key Benefits

1. **Proper Status Mapping**: API statuses now correctly map to UI display
2. **Visual Feedback**: Users can easily identify unmapped or problematic fields
3. **Seamless Toggle**: Switch between mock and real data without issues
4. **Data Consistency**: Both dashboard and detail views use the same data source
5. **Error Resilience**: Graceful fallback when API calls fail
6. **Developer Friendly**: Console logging for debugging and monitoring

## 🧪 Testing

- **Toggle Functionality**: Switch between Mock and API modes
- **Status Display**: Verify correct status mapping and display
- **Unmapped Fields**: Check highlighting of problematic fields
- **Navigation**: Click on manuscripts to view details with API data
- **Error Handling**: Test with API failures to ensure fallback works

## 📊 Data Flow

1. **API Call** → **Status Mapping** → **UI Display**
2. **Unmapped Field Detection** → **Visual Highlighting**
3. **Toggle Switch** → **Data Source Change** → **UI Update**
4. **Error Handling** → **Fallback to Mock Data**

The implementation ensures that all API data is properly mapped to the UI expectations while clearly highlighting any fields that don't have direct API equivalents.
