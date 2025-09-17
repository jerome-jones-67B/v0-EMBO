import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/api-auth';
import { shouldBypassAuth, getDevUser } from '@/lib/dev-bypass-auth';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    if (!shouldBypassAuth()) {
      const authResponse = validateApiAuth(request);
      if (authResponse) {
        return authResponse;
      }
    }

    const manuscriptId = params.id;
    
    // Call Data4Rev API for manuscript content
    const data4revResponse = await fetch(
      `${config.DATA4REV_API_BASE}/v1/manuscripts/${manuscriptId}/content`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${process.env.DATA4REV_API_TOKEN}`
        }
      }
    );

    if (!data4revResponse.ok) {
      console.error(`Data4Rev content API error: ${data4revResponse.status}`);
      
      // Fallback to mock content
      const mockContent = {
        content: `# Molecular mechanisms of protein folding in cellular environments

## Abstract
The complex process of protein folding in living cells involves multiple chaperone systems and quality control mechanisms that ensure proper protein function. This study investigates the molecular pathways involved in co-translational and post-translational protein folding, with particular emphasis on the role of heat shock proteins and the unfolded protein response.

## Introduction
Protein folding is one of the most fundamental processes in molecular biology, determining the three-dimensional structure that enables proteins to perform their biological functions. In the crowded environment of the cell, this process is facilitated by molecular chaperones and monitored by quality control systems.

## Methods
### Cell Culture and Protein Expression
HEK293T cells were cultured in DMEM supplemented with 10% FBS under standard conditions. Protein expression was induced using doxycycline-inducible systems to control timing and expression levels.

### Fluorescence Microscopy
Live-cell imaging was performed using a confocal microscope with environmental control to maintain physiological conditions during observation.

### Biochemical Assays
Protein folding kinetics were monitored using fluorescence spectroscopy and dynamic light scattering to assess aggregation states.

## Results
Our findings demonstrate that the cellular protein folding machinery operates through coordinated networks of chaperones and co-chaperones. The data show significant improvements in folding efficiency when chaperone expression is optimized.

### Figure 1: Protein Folding Pathway Analysis
The analysis reveals distinct folding intermediates that can be captured and characterized using our experimental approach.

### Figure 2: Chaperone Network Interactions
Network analysis shows the interconnected nature of different chaperone systems in maintaining protein homeostasis.

## Discussion
The results provide new insights into the complexity of protein folding in cellular environments. The implications for understanding protein misfolding diseases are significant and warrant further investigation.

## Conclusions
This work establishes a framework for studying protein folding dynamics in living cells and identifies key regulatory mechanisms that control folding efficiency.

## References
1. Smith, J. et al. Protein folding mechanisms. Nature 2023; 615: 123-135.
2. Johnson, A. & Williams, B. Chaperone networks in cells. Cell 2023; 186: 456-470.
3. Brown, C. et al. Misfolding diseases. Science 2023; 380: 789-801.

## Supplementary Information
Additional experimental details and extended data figures are available in the supplementary materials.`,
        content_type: 'text/markdown',
        word_count: 1247,
        fallback: true,
        source: 'mock'
      };

      return NextResponse.json(mockContent);
    }

    const contentData = await data4revResponse.json();
    
    // Handle different response formats from the API
    let processedContent;
    if (typeof contentData === 'string') {
      processedContent = {
        content: contentData,
        content_type: 'text/plain',
        word_count: contentData.split(/\s+/).length,
        fallback: false,
        source: 'data4rev-api'
      };
    } else {
      processedContent = {
        ...contentData,
        fallback: false,
        source: 'data4rev-api'
      };
    }
    
    return NextResponse.json(processedContent);

  } catch (error) {
    console.error('Content API error:', error);
    
    // Return minimal mock content on error
    return NextResponse.json({
      content: 'Unable to load manuscript content. Please try again later.',
      content_type: 'text/plain',
      word_count: 10,
      fallback: true,
      source: 'mock-error',
      error: 'Failed to fetch content'
    });
  }
}