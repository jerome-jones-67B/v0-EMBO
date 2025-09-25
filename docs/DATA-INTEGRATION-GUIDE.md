# Data Integration Guide

This guide explains how to use the data integration system to populate the mock data with real figure data and AI feedback from check4viz.json files.

## Overview

The data integration system allows you to:
- Load real figure data with images and metadata
- Process check4viz.json files containing AI feedback
- Convert the data to the format used by the manuscript review system
- Preview and integrate the data into the mock data

## Components

### 1. Data Integration Utilities (`lib/data-integration.ts`)
- `Check4VizData`: Interface for check4viz.json data
- `RealFigureData`: Interface for real figure data
- `convertCheck4VizToQCCheck()`: Converts check4viz data to QC check format
- `convertRealFigureToMock()`: Converts real figure data to mock format
- `integrateRealFigureData()`: Integrates real data with existing mock data

### 2. Data Loader (`lib/data-loader.ts`)
- `loadCheck4VizData()`: Loads check4viz.json files
- `processCheck4VizData()`: Processes and structures the data
- `loadAndIntegrateRealFigureData()`: Complete workflow function
- `createDataIntegrationWorkflow()`: Creates a workflow instance

### 3. Data Integration Manager (`components/data-integration-manager.tsx`)
- UI component for managing data integration
- Load example data or upload custom files
- Preview processed data before integration
- Integrate data with existing mock data

## Usage

### Step 1: Access the Data Integration Page
1. Go to the main dashboard
2. Click the "Data Integration" button in the header
3. This opens the data integration manager

### Step 2: Load Data
You can either:
- **Load Example Data**: Click "Load Example Figure 1" or "Load Example Figure 2" to see how the system works
- **Upload Custom Data**: Use the form to enter your own figure data and checks

### Step 3: Preview Data
- Switch to the "Preview" tab to see how your data will look
- Review the QC checks and their categorization
- Verify the panel structure and metadata

### Step 4: Integrate Data
- Switch to the "Integrate" tab
- Click "Process and Preview Data" to process your data
- Click "Integrate with Mock Data" to add it to the system

## Data Format

### check4viz.json Format
```json
[
  {
    "type": "issue" | "suggestion",
    "message": "Brief description of the check",
    "details": "Detailed explanation",
    "prompt": "The original prompt used to generate this check",
    "panelId": "Panel identifier (e.g., '1A', '1B')"
  }
]
```

### Figure Data Format
```typescript
{
  id: string;
  title: string;
  legend: string;
  panels: {
    id: string;
    description: string;
    legend: string;
    imagePath: string;
    checks: Check4VizData[];
  }[];
  linkedData?: any[];
}
```

## Example Workflow

1. **Prepare your data**:
   - Create a check4viz.json file with your AI feedback
   - Prepare figure images and metadata
   - Define panel structure

2. **Load the data**:
   - Use the data integration manager to load your files
   - Or manually enter the data using the form

3. **Preview and validate**:
   - Check that the data is structured correctly
   - Verify that QC checks are properly categorized
   - Ensure panel information is complete

4. **Integrate**:
   - Process the data to convert it to the mock format
   - Integrate it with existing mock data
   - Test the integrated data in the manuscript review system

## Tips

- **Check Types**: Use "issue" for problems that need fixing, "suggestion" for improvements
- **Panel IDs**: Use consistent naming like "1A", "1B", "2A", etc.
- **Image Paths**: Use relative paths from the public directory
- **Prompts**: Include the original AI prompts for reference and transparency

## Troubleshooting

- **Data not loading**: Check that your JSON files are valid
- **Checks not showing**: Verify that panel IDs match between checks and panels
- **Images not displaying**: Ensure image paths are correct and files exist
- **Integration failing**: Check that all required fields are present

## Next Steps

Once you have integrated your data:
1. Test it in the manuscript review system
2. Verify that QC checks display correctly
3. Check that AI icons and functionality work
4. Make any necessary adjustments to the data structure
