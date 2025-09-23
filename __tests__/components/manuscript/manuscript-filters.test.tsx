import { render, screen, fireEvent } from '@testing-library/react'
import { ManuscriptFilters } from '@/components/manuscript/manuscript-filters'
import type { FilterState, Manuscript } from '@/types/manuscript'

const mockManuscripts: Manuscript[] = [
  {
    id: '1',
    msid: 'EMBO-2024-001',
    receivedDate: '2024-01-15',
    title: 'Test Manuscript 1',
    authors: 'Author One',
    status: 'Under Review',
    workflowState: 'in-review',
    priority: 'high',
    hasErrors: false,
    hasWarnings: false,
    notes: 'Test notes',
    lastModified: '2024-01-20T10:30:00Z',
    displayStatus: 'Under Review',
    badgeVariant: 'default',
    isMapped: true,
    unmappedFields: [],
    assignedTo: 'Dr. Sarah Chen'
  },
  {
    id: '2',
    msid: 'EMBO-2024-002',
    receivedDate: '2024-01-18',
    title: 'Test Manuscript 2',
    authors: 'Author Two',
    status: 'Pending Review',
    workflowState: 'pending',
    priority: 'medium',
    hasErrors: false,
    hasWarnings: true,
    notes: 'Test notes 2',
    lastModified: '2024-01-19T14:45:00Z',
    displayStatus: 'Pending Review',
    badgeVariant: 'secondary',
    isMapped: true,
    unmappedFields: [],
    assignedTo: 'Dr. Michael Rodriguez'
  }
]

const mockFilters: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  assignedTo: 'all'
}

const mockProps = {
  filters: mockFilters,
  onFilterChange: jest.fn(),
  onClearFilters: jest.fn(),
  manuscripts: mockManuscripts,
  uniqueAssignees: ['Dr. Sarah Chen', 'Dr. Michael Rodriguez']
}

describe('ManuscriptFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render filter components', () => {
    render(<ManuscriptFilters {...mockProps} />)

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search manuscripts...')).toBeInTheDocument()
    expect(screen.getByText('All Statuses')).toBeInTheDocument()
    expect(screen.getByText('All Priorities')).toBeInTheDocument()
    expect(screen.getByText('All Assignees')).toBeInTheDocument()
  })

  it('should handle search input', () => {
    render(<ManuscriptFilters {...mockProps} />)

    const searchInput = screen.getByPlaceholderText('Search manuscripts...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('search', 'test search')
  })

  it('should show active filter badge when filters are applied', () => {
    const activeFilters = {
      ...mockFilters,
      search: 'test',
      status: 'pending'
    }

    render(
      <ManuscriptFilters
        {...mockProps}
        filters={activeFilters}
      />
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should display active filter badges', () => {
    const activeFilters = {
      ...mockFilters,
      search: 'test search',
      status: 'pending'
    }

    render(
      <ManuscriptFilters
        {...mockProps}
        filters={activeFilters}
      />
    )

    expect(screen.getByText('Search: test search')).toBeInTheDocument()
    expect(screen.getByText('Status: pending')).toBeInTheDocument()
    expect(screen.getByText('Clear All')).toBeInTheDocument()
  })

  it('should call onClearFilters when Clear All is clicked', () => {
    const activeFilters = {
      ...mockFilters,
      search: 'test'
    }

    render(
      <ManuscriptFilters
        {...mockProps}
        filters={activeFilters}
      />
    )

    const clearButton = screen.getByText('Clear All')
    fireEvent.click(clearButton)

    expect(mockProps.onClearFilters).toHaveBeenCalled()
  })

  it('should not show active filters section when no filters are applied', () => {
    render(<ManuscriptFilters {...mockProps} />)

    expect(screen.queryByText('Active filters:')).not.toBeInTheDocument()
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
  })
})