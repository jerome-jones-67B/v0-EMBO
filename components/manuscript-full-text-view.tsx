import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Clock,
  Download,
  AlertCircle,
} from "lucide-react"

interface FullTextViewProps {
  useApiData: boolean
  isLoadingFullText: boolean
  fullTextError: string | null
  fullTextContent: string
  fullTextMetadata: any
  fetchFullTextContent: () => void
}

export const FullTextView: React.FC<FullTextViewProps> = ({
  useApiData,
  isLoadingFullText,
  fullTextError,
  fullTextContent,
  fullTextMetadata,
  fetchFullTextContent,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Full Text Content</h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Complete manuscript text and content
            </p>
            {fullTextMetadata && (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full border bg-gray-50">
                  {fullTextMetadata.fallback ? '📄 Demo Content' : '🔗 Live API'}
                </span>
                {fullTextMetadata.wordCount && (
                  <span className="text-xs text-muted-foreground">
                    {fullTextMetadata.wordCount.toLocaleString()} words
                  </span>
                )}
                {fullTextMetadata.contentType && (
                  <span className="text-xs text-muted-foreground">
                    {fullTextMetadata.contentType}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {useApiData && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFullTextContent}
              disabled={isLoadingFullText}
            >
              {isLoadingFullText ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Refresh Content
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {!useApiData ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">API Data Required</h4>
              <p className="text-muted-foreground">
                Full text viewing is only available when using live API data. 
                Please switch to API mode to view manuscript content.
              </p>
            </div>
          ) : isLoadingFullText ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 animate-spin" />
                <span>Loading full text content...</span>
              </div>
            </div>
          ) : fullTextError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
              <h4 className="text-lg font-medium mb-2">Content Unavailable</h4>
              <p className="text-muted-foreground max-w-md mx-auto">
                {fullTextError}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchFullTextContent}
              >
                <Download className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : fullTextContent ? (
            <div className="space-y-4">
              {/* Content Info Bar */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Content Statistics
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{fullTextContent.length.toLocaleString()} characters</span>
                    {fullTextMetadata?.wordCount && (
                      <span>{fullTextMetadata.wordCount.toLocaleString()} words</span>
                    )}
                    {fullTextMetadata?.source && (
                      <span>Source: {fullTextMetadata.source}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {fullTextMetadata?.fallback && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                      ⚠️ Demo Content
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(fullTextContent)}
                    className="hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </div>

              {/* Content Display Area */}
              <div className="relative">
                <div 
                  className="max-h-[600px] overflow-y-auto p-4 bg-white rounded-lg border font-mono text-sm whitespace-pre-wrap"
                  style={{ lineHeight: '1.6' }}
                >
                  {fullTextContent}
                </div>
                {fullTextContent.length > 5000 && (
                  <div className="absolute bottom-2 right-2">
                    <span className="text-xs bg-white/90 text-gray-500 px-2 py-1 rounded border shadow-sm">
                      Scroll to read more...
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No Content Loaded</h4>
              <p className="text-muted-foreground mb-4">
                Click the button below to load the full text content for this manuscript.
              </p>
              <Button onClick={fetchFullTextContent}>
                <Download className="w-4 h-4 mr-2" />
                Load Full Text
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
