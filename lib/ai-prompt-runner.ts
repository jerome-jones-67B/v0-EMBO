// AI prompt runner for processing real figure data with actual prompts

export interface PromptResult {
  panelId: string
  promptId: string
  result: any
  timestamp: string
}

export interface AIPromptRunner {
  runPromptOnFigure(figureData: any, promptId: string): Promise<PromptResult[]>
  runAllPromptsOnFigure(figureData: any): Promise<PromptResult[]>
  convertPromptResultsToQCChecks(results: PromptResult[]): any[]
}

// Mock AI prompt runner (replace with actual AI service)
export class MockAIPromptRunner implements AIPromptRunner {
  async runPromptOnFigure(figureData: any, promptId: string): Promise<PromptResult[]> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const results: PromptResult[] = []
    
    // Process each panel with the specific prompt
    figureData.panels.forEach((panel: any) => {
      const result = this.processPanelWithPrompt(panel, promptId, figureData.legend)
      if (result) {
        results.push({
          panelId: panel.id,
          promptId,
          result,
          timestamp: new Date().toISOString()
        })
      }
    })
    
    return results
  }
  
  async runAllPromptsOnFigure(figureData: any): Promise<PromptResult[]> {
    const allResults: PromptResult[] = []
    
    for (const prompt of figureData.prompts) {
      const results = await this.runPromptOnFigure(figureData, prompt.id)
      allResults.push(...results)
    }
    
    return allResults
  }
  
  convertPromptResultsToQCChecks(results: PromptResult[]): any[] {
    return results.map(result => {
      const qcCheck = this.convertPromptResultToQCCheck(result)
      return qcCheck
    }).filter(check => check !== null)
  }
  
  private processPanelWithPrompt(panel: any, promptId: string, fullLegend: string): any | null {
    // Simulate AI analysis based on the prompt type
    switch (promptId) {
      case 'error-bars-defined':
        return this.analyzeErrorBars(panel, fullLegend)
      case 'individual-data-points':
        return this.analyzeIndividualDataPoints(panel, fullLegend)
      case 'micrograph-scale-bar':
        return this.analyzeScaleBars(panel, fullLegend)
      case 'replicates-defined':
        return this.analyzeReplicates(panel, fullLegend)
      case 'stat-test-mentioned':
        return this.analyzeStatisticalTests(panel, fullLegend)
      default:
        return null
    }
  }
  
  private analyzeErrorBars(panel: any, fullLegend: string): any {
    // Simulate AI analysis for error bars
    const hasErrorBars = this.detectErrorBarsInLegend(panel.legend, fullLegend)
    const isDefined = this.checkErrorBarDefinition(panel.legend, fullLegend)
    
    return {
      panel_label: panel.id,
      error_bar_on_figure: hasErrorBars ? "yes" : "no",
      error_bar_defined_in_caption: isDefined ? "yes" : "no",
      error_bar_definition: isDefined ? this.extractErrorBarDefinition(panel.legend, fullLegend) : ""
    }
  }
  
  private analyzeIndividualDataPoints(panel: any, fullLegend: string): any {
    // Simulate AI analysis for individual data points
    const isPlot = this.isPlotPanel(panel.legend)
    const hasAverages = this.hasAverageValues(panel.legend, fullLegend)
    const hasIndividualPoints = this.hasIndividualDataPoints(panel.legend, fullLegend)
    
    return {
      panel_label: panel.id,
      plot: isPlot ? "yes" : "no",
      average_values: hasAverages ? "yes" : "no",
      individual_values: hasIndividualPoints ? "yes" : "not needed"
    }
  }
  
  private analyzeScaleBars(panel: any, fullLegend: string): any {
    // Simulate AI analysis for scale bars
    const isMicrograph = this.isMicrographPanel(panel.legend)
    const hasScaleBar = this.hasScaleBar(panel.legend, fullLegend)
    const isDefined = this.isScaleBarDefined(panel.legend, fullLegend)
    
    return {
      panel_label: panel.id,
      micrograph: isMicrograph ? "yes" : "no",
      scale_bar_on_image: hasScaleBar ? "yes" : "no",
      scale_bar_defined_in_caption: isDefined ? "yes" : "no",
      from_the_caption: isDefined ? this.extractScaleBarDefinition(panel.legend, fullLegend) : ""
    }
  }
  
  private analyzeReplicates(panel: any, fullLegend: string): any {
    // Simulate AI analysis for replicates
    const involvesReplicates = this.involvesReplicates(panel.legend, fullLegend)
    const replicateInfo = this.extractReplicateInfo(panel.legend, fullLegend)
    
    return {
      panel_label: panel.id,
      involves_replicates: involvesReplicates ? "yes" : "no",
      number_of_replicates: replicateInfo.numbers,
      type_of_replicates: replicateInfo.types
    }
  }
  
  private analyzeStatisticalTests(panel: any, fullLegend: string): any {
    // Simulate AI analysis for statistical tests
    const isPlot = this.isPlotPanel(panel.legend)
    const needsTest = this.needsStatisticalTest(panel.legend, fullLegend)
    const hasTest = this.hasStatisticalTest(panel.legend, fullLegend)
    
    return {
      panel_label: panel.id,
      is_a_plot: isPlot ? "yes" : "no",
      statistical_test_needed: needsTest ? "yes" : "no",
      statistica_test_mentioned: hasTest ? "yes" : "no",
      justify_why_test_is_missing: needsTest && !hasTest ? "Statistical significance is indicated but test is not mentioned" : "",
      from_the_caption: hasTest ? this.extractStatisticalTest(panel.legend, fullLegend) : ""
    }
  }
  
  // Helper methods for AI analysis simulation
  private detectErrorBarsInLegend(panelLegend: string, fullLegend: string): boolean {
    const errorBarKeywords = ['error', 'SEM', 'SD', 'standard', 'deviation', 'mean±', '±']
    return errorBarKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private checkErrorBarDefinition(panelLegend: string, fullLegend: string): boolean {
    const definitionKeywords = ['error bars', 'SEM', 'standard error', 'standard deviation', 'mean±']
    return definitionKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private extractErrorBarDefinition(panelLegend: string, fullLegend: string): string {
    // Extract error bar definition from legend
    const errorBarMatch = panelLegend.match(/(error bars?[^.]*)/i) || 
                         fullLegend.match(/(error bars?[^.]*)/i)
    return errorBarMatch ? errorBarMatch[1] : ""
  }
  
  private isPlotPanel(panelLegend: string): boolean {
    const plotKeywords = ['plot', 'graph', 'chart', 'analysis', 'quantitative', 'measurement']
    return plotKeywords.some(keyword => panelLegend.toLowerCase().includes(keyword))
  }
  
  private hasAverageValues(panelLegend: string, fullLegend: string): boolean {
    const averageKeywords = ['mean', 'average', '±', 'error', 'SEM', 'SD']
    return averageKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private hasIndividualDataPoints(panelLegend: string, fullLegend: string): boolean {
    const individualKeywords = ['individual', 'each', 'point', 'dot', 'scatter']
    return individualKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private isMicrographPanel(panelLegend: string): boolean {
    const micrographKeywords = ['micrograph', 'microscopy', 'microscopic', 'scale bar', 'μm', 'μM']
    return micrographKeywords.some(keyword => panelLegend.toLowerCase().includes(keyword))
  }
  
  private hasScaleBar(panelLegend: string, fullLegend: string): boolean {
    const scaleBarKeywords = ['scale bar', 'μm', 'μM', 'micron', 'micrometer']
    return scaleBarKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private isScaleBarDefined(panelLegend: string, fullLegend: string): boolean {
    const scaleBarMatch = panelLegend.match(/scale bar[^.]*/i) || fullLegend.match(/scale bar[^.]*/i)
    return !!scaleBarMatch
  }
  
  private extractScaleBarDefinition(panelLegend: string, fullLegend: string): string {
    const scaleBarMatch = panelLegend.match(/scale bar[^.]*/i) || fullLegend.match(/scale bar[^.]*/i)
    return scaleBarMatch ? scaleBarMatch[0] : ""
  }
  
  private involvesReplicates(panelLegend: string, fullLegend: string): boolean {
    const replicateKeywords = ['n=', 'n =', 'experiments', 'replicates', 'samples', 'independent']
    return replicateKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private extractReplicateInfo(panelLegend: string, fullLegend: string): { numbers: string[], types: string[] } {
    const nMatch = panelLegend.match(/n\s*=\s*(\d+)/i) || fullLegend.match(/n\s*=\s*(\d+)/i)
    const numbers = nMatch ? [nMatch[1]] : []
    
    const typeKeywords = ['independent experiments', 'technical replicates', 'samples', 'mice', 'cells']
    const types = typeKeywords.filter(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
    
    return { numbers, types }
  }
  
  private needsStatisticalTest(panelLegend: string, fullLegend: string): boolean {
    const significanceKeywords = ['p<', 'p <', 'p=', 'p =', 'significant', 'significance', '*', '***']
    return significanceKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private hasStatisticalTest(panelLegend: string, fullLegend: string): boolean {
    const testKeywords = ['t-test', 't test', 'ANOVA', 'Mann-Whitney', 'Wilcoxon', 'chi-square', 'Fisher']
    return testKeywords.some(keyword => 
      panelLegend.toLowerCase().includes(keyword) || fullLegend.toLowerCase().includes(keyword)
    )
  }
  
  private extractStatisticalTest(panelLegend: string, fullLegend: string): string {
    const testMatch = panelLegend.match(/(t-test|t test|ANOVA|Mann-Whitney|Wilcoxon|chi-square|Fisher)[^.]*/i) || 
                     fullLegend.match(/(t-test|t test|ANOVA|Mann-Whitney|Wilcoxon|chi-square|Fisher)[^.]*/i)
    return testMatch ? testMatch[0] : ""
  }
  
  private convertPromptResultToQCCheck(result: PromptResult): any | null {
    const { panelId, promptId, result: analysis } = result
    
    // Convert analysis result to QC check based on prompt type
    switch (promptId) {
      case 'error-bars-defined':
        return this.convertErrorBarsResult(panelId, analysis)
      case 'individual-data-points':
        return this.convertIndividualDataPointsResult(panelId, analysis)
      case 'micrograph-scale-bar':
        return this.convertScaleBarResult(panelId, analysis)
      case 'replicates-defined':
        return this.convertReplicatesResult(panelId, analysis)
      case 'stat-test-mentioned':
        return this.convertStatisticalTestResult(panelId, analysis)
      default:
        return null
    }
  }
  
  private convertErrorBarsResult(panelId: string, analysis: any): any {
    const hasErrorBars = analysis.error_bar_on_figure === "yes"
    const isDefined = analysis.error_bar_defined_in_caption === "yes"
    
    if (!hasErrorBars) return null
    
    return {
      id: `${panelId}-error-bars-${Date.now()}`,
      type: isDefined ? "info" : "warning",
      message: isDefined ? "Error bars are properly defined" : "Error bars should be clearly defined in the caption",
      details: isDefined ? analysis.error_bar_definition : "Error bars are present but not clearly explained in the figure legend",
      aiGenerated: true,
      dismissed: false,
      panelId: panelId,
      timestamp: new Date().toISOString()
    }
  }
  
  private convertIndividualDataPointsResult(panelId: string, analysis: any): any {
    const isPlot = analysis.plot === "yes"
    const hasAverages = analysis.average_values === "yes"
    const hasIndividual = analysis.individual_values === "yes"
    
    if (!isPlot || !hasAverages) return null
    
    return {
      id: `${panelId}-individual-points-${Date.now()}`,
      type: hasIndividual ? "info" : "suggestion",
      message: hasIndividual ? "Individual data points are shown" : "Consider showing individual data points",
      details: hasIndividual ? "Good practice to show both individual measurements and summary statistics" : "Individual data points provide more transparency about data distribution",
      aiGenerated: true,
      dismissed: false,
      panelId: panelId,
      timestamp: new Date().toISOString()
    }
  }
  
  private convertScaleBarResult(panelId: string, analysis: any): any {
    const isMicrograph = analysis.micrograph === "yes"
    const hasScaleBar = analysis.scale_bar_on_image === "yes"
    const isDefined = analysis.scale_bar_defined_in_caption === "yes"
    
    if (!isMicrograph) return null
    
    return {
      id: `${panelId}-scale-bar-${Date.now()}`,
      type: hasScaleBar && isDefined ? "info" : "issue",
      message: hasScaleBar && isDefined ? "Scale bar is properly defined" : "Scale bar may be missing or unclear",
      details: hasScaleBar && isDefined ? analysis.from_the_caption : "Micrographs should include clearly labeled scale bars",
      aiGenerated: true,
      dismissed: false,
      panelId: panelId,
      timestamp: new Date().toISOString()
    }
  }
  
  private convertReplicatesResult(panelId: string, analysis: any): any {
    const involvesReplicates = analysis.involves_replicates === "yes"
    const hasNumbers = analysis.number_of_replicates.length > 0
    const hasTypes = analysis.type_of_replicates.length > 0
    
    if (!involvesReplicates) return null
    
    return {
      id: `${panelId}-replicates-${Date.now()}`,
      type: hasNumbers && hasTypes ? "info" : "suggestion",
      message: hasNumbers && hasTypes ? "Replicate information is clearly stated" : "Replicate information should be clearly stated",
      details: hasNumbers && hasTypes ? 
        `n=${analysis.number_of_replicates.join(', ')} (${analysis.type_of_replicates.join(', ')})` : 
        "The number and type of replicates should be explicitly mentioned",
      aiGenerated: true,
      dismissed: false,
      panelId: panelId,
      timestamp: new Date().toISOString()
    }
  }
  
  private convertStatisticalTestResult(panelId: string, analysis: any): any {
    const isPlot = analysis.is_a_plot === "yes"
    const needsTest = analysis.statistical_test_needed === "yes"
    const hasTest = analysis.statistica_test_mentioned === "yes"
    
    if (!isPlot || !needsTest) return null
    
    return {
      id: `${panelId}-stat-test-${Date.now()}`,
      type: hasTest ? "info" : "suggestion",
      message: hasTest ? "Statistical test is properly mentioned" : "Statistical test should be mentioned if applicable",
      details: hasTest ? analysis.from_the_caption : analysis.justify_why_test_is_missing,
      aiGenerated: true,
      dismissed: false,
      panelId: panelId,
      timestamp: new Date().toISOString()
    }
  }
}

// Export a singleton instance
export const aiPromptRunner = new MockAIPromptRunner()
