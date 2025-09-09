// Test script to verify real data loading works

import { loadAllFigures } from './real-data-loader'

export async function testRealDataLoading() {
  console.log('Testing real data loading...')
  
  try {
    const figures = await loadAllFigures()
    
    console.log(`Loaded ${figures.length} figures:`)
    
    figures.forEach((figure, index) => {
      console.log(`\nFigure ${index + 1}:`)
      console.log(`  ID: ${figure.id}`)
      console.log(`  Title: ${figure.title}`)
      console.log(`  Panels: ${figure.panels.length}`)
      console.log(`  Prompts: ${figure.prompts.length}`)
      console.log(`  QC Checks: ${figure.qcChecks.length}`)
      
      console.log(`  Panel IDs: ${figure.panels.map(p => p.id).join(', ')}`)
      console.log(`  Prompt Types: ${figure.prompts.map(p => p.id).join(', ')}`)
    })
    
    return figures
  } catch (error) {
    console.error('Error testing real data loading:', error)
    return []
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testRealDataLoading()
}
