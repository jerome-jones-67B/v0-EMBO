// Shared Components
export { LoadingSpinner } from './shared/loading-spinner'
export { ErrorBoundary } from './shared/error-boundary'

// Manuscript Components
export { ManuscriptFilters } from './manuscript/manuscript-filters'
export { ManuscriptTableHeader } from './manuscript/manuscript-table-header'
export { ManuscriptTableRow } from './manuscript/manuscript-table-row'
export { ColumnSettings } from './manuscript/column-settings'
export { ManuscriptDashboardRefactored } from './manuscript/manuscript-dashboard-refactored'
export { FigureViewer } from './manuscript/figure-viewer'
export { ManuscriptHeader } from './manuscript/manuscript-header'
export { ManuscriptDetailRefactored } from './manuscript/manuscript-detail-refactored'

// UI Components (re-export from ui for convenience)
export { Button } from './ui/button'
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
export { Input } from './ui/input'
export { Label } from './ui/label'
export { Badge } from './ui/badge'
export { Switch } from './ui/switch'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
export { Checkbox } from './ui/checkbox'
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
export { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuSub, 
  DropdownMenuSubContent, 
  DropdownMenuSubTrigger, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
export { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select'
export { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './ui/popover'
export { ScrollArea } from './ui/scroll-area'
export { Separator } from './ui/separator'
export type { ChartConfig } from "./ui/chart"
export { Toaster as SonnerToaster } from "./ui/sonner"