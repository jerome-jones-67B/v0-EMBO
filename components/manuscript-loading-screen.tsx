import React from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  FileText,
  Database,
} from "lucide-react"

interface ManuscriptLoadingScreenProps {
  useApiData: boolean
  onBack: () => void
}

export const ManuscriptLoadingScreen: React.FC<ManuscriptLoadingScreenProps> = ({
  useApiData,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Loading Manuscript Details</h2>
          <p className="text-gray-600">
            {useApiData 
              ? "Fetching detailed manuscript data from Data4Rev API..."
              : "Preparing manuscript review interface..."
            }
          </p>
        </div>
        {useApiData && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Database className="w-4 h-4 text-green-600" />
            <span>Connected to live API</span>
          </div>
        )}
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>
    </div>
  )
}
