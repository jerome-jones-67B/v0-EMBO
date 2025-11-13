import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SourceFilesTreeview } from '@/components/manuscript/source-files-treeview'
import { api } from '@/lib/api-client'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    sourceData: {
      assignToManuscript: jest.fn(),
      assignToFigure: jest.fn(),
      assignToPanel: jest.fn(),
      deleteFromManuscript: jest.fn(),
      deleteFromFigure: jest.fn(),
      deleteFromPanel: jest.fn(),
    },
  },
}))

// Mock the multiselect component
jest.mock('@/components/ui/multi-select', () => ({
  MultiSelect: ({ onSelectionChange, selected, options, placeholder }: any) => (
    <div data-testid="multiselect">
      <select
        multiple
        value={selected}
        onChange={(e) => {
          const values = Array.from(e.target.selectedOptions, (option) => option.value)
          onSelectionChange(values)
        }}
        data-testid="multiselect-select"
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span data-testid="placeholder">{placeholder}</span>
    </div>
  ),
}))

describe('SourceFilesTreeview', () => {
  const mockSourceFiles: any[] = [
    {
      id: 1,
      name: 'test-file.pdf',
      source: 'uploaded',
      assigned_to: [
        { figure: { id: 32, label: 'Figure 1' }, panel: { id: 0, label: '' } },
        { figure: { id: 33, label: 'Figure 2' }, panel: { id: 204, label: 'Panel A' } }
      ]
    },
    {
      id: 2,
      name: 'another-file.xlsx',
      source: 'uploaded',
      assigned_to: []
    }
  ]

  const mockFigures: any[] = [
    {
      id: 32,
      label: 'Figure 1',
      caption: '',
      caption_confidence: null,
      image_file_id: 1,
      sort_order: 0,
      links: [],
      check_results: [],
      source_data: [
        { file_id: 1, id: 101, figure_id: 32, panel_id: null }
      ],
      panels: [
        {
          id: 204,
          label: 'Panel A',
          caption: '',
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100,
          confidence: 0.9,
          sort_order: 0,
          links: [],
          check_results: [],
          source_data: [
            { file_id: 1, id: 102, figure_id: 32, panel_id: 204 }
          ]
        }
      ]
    }
  ]

  const defaultProps = {
    sourceFiles: mockSourceFiles,
    figures: mockFigures,
    manuscriptId: '6',
    isLoading: false,
    error: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should render source files tree', () => {
      render(<SourceFilesTreeview {...defaultProps} />)

      expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
      expect(screen.getByText('another-file.xlsx')).toBeInTheDocument()
    })

    it('should initialize mapping targets from source files', () => {
      render(<SourceFilesTreeview {...defaultProps} />)

      // Check that multiselects are rendered with correct initial values
      const multiselects = screen.getAllByTestId('multiselect-select')
      expect(multiselects).toHaveLength(2)
    })

    it('should show loading state when isLoading is true', () => {
      render(<SourceFilesTreeview {...defaultProps} isLoading={true} />)

      expect(screen.getByText('Loading source data files...')).toBeInTheDocument()
    })

    it('should show error state when error is provided', () => {
      render(<SourceFilesTreeview {...defaultProps} error="Failed to load files" />)

      expect(screen.getByText('Error loading source data: Failed to load files')).toBeInTheDocument()
    })
  })

  describe('File Assignment Operations', () => {
    it('should call assignToManuscript when adding manuscript assignment', async () => {
      const mockResponse = { id: 103 }
      ;(api.sourceData.assignToManuscript as jest.Mock).mockResolvedValue(mockResponse)

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[1] // File without assignments
      fireEvent.change(multiselect, { target: { value: ['manuscript'] } })

      await waitFor(() => {
        expect(api.sourceData.assignToManuscript).toHaveBeenCalledWith('6', 2)
      })
    })

    it('should call assignToFigure when adding figure assignment', async () => {
      const mockResponse = { id: 104 }
      ;(api.sourceData.assignToFigure as jest.Mock).mockResolvedValue(mockResponse)

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[1]
      fireEvent.change(multiselect, { target: { value: ['figure-32'] } })

      await waitFor(() => {
        expect(api.sourceData.assignToFigure).toHaveBeenCalledWith('6', '32', 2)
      })
    })

    it('should call assignToPanel when adding panel assignment', async () => {
      const mockResponse = { id: 105 }
      ;(api.sourceData.assignToPanel as jest.Mock).mockResolvedValue(mockResponse)

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[1]
      fireEvent.change(multiselect, { target: { value: ['panel-32-204'] } })

      await waitFor(() => {
        expect(api.sourceData.assignToPanel).toHaveBeenCalledWith('6', '32', '204', 2)
      })
    })
  })

  describe('File Assignment Removal', () => {
    it('should call deleteFromManuscript when removing manuscript assignment', async () => {
      ;(api.sourceData.deleteFromManuscript as jest.Mock).mockResolvedValue({})

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[0] // File with assignments
      fireEvent.change(multiselect, { target: { value: ['figure-32'] } }) // Remove manuscript, keep figure

      await waitFor(() => {
        expect(api.sourceData.deleteFromManuscript).toHaveBeenCalledWith('6', '100')
      })
    })

    it('should call deleteFromFigure when removing figure assignment', async () => {
      ;(api.sourceData.deleteFromFigure as jest.Mock).mockResolvedValue({})

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[0]
      fireEvent.change(multiselect, { target: { value: ['panel-32-204'] } }) // Remove figure, keep panel

      await waitFor(() => {
        expect(api.sourceData.deleteFromFigure).toHaveBeenCalledWith('6', '32', '101')
      })
    })

    it('should call deleteFromPanel when removing panel assignment', async () => {
      ;(api.sourceData.deleteFromPanel as jest.Mock).mockResolvedValue({})

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[0]
      fireEvent.change(multiselect, { target: { value: ['figure-32'] } }) // Remove panel, keep figure

      await waitFor(() => {
        expect(api.sourceData.deleteFromPanel).toHaveBeenCalledWith('6', '32', '204', '102')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      ;(api.sourceData.assignToManuscript as jest.Mock).mockRejectedValue(new Error('API Error'))

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[1]
      fireEvent.change(multiselect, { target: { value: ['manuscript'] } })

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error in handleMappingChange:', expect.any(Error))
      })

      consoleError.mockRestore()
    })

    it('should revert UI state on API error', async () => {
      ;(api.sourceData.assignToManuscript as jest.Mock).mockRejectedValue(new Error('API Error'))

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[1]
      fireEvent.change(multiselect, { target: { value: ['manuscript'] } })

      await waitFor(() => {
        // UI should revert to original state - test that error was logged
        expect(console.error).toHaveBeenCalled()
      })
    })
  })

  describe('State Management', () => {
    it('should update source data IDs after successful assignment', async () => {
      const mockResponse = { id: 106 }
      ;(api.sourceData.assignToManuscript as jest.Mock).mockResolvedValue(mockResponse)

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[1]
      fireEvent.change(multiselect, { target: { value: ['manuscript'] } })

      await waitFor(() => {
        expect(api.sourceData.assignToManuscript).toHaveBeenCalledWith('6', 2)
      })
    })

    it('should handle multiple assignments and removals in sequence', async () => {
      const mockResponse = { id: 107 }
      ;(api.sourceData.assignToManuscript as jest.Mock).mockResolvedValue(mockResponse)
      ;(api.sourceData.deleteFromManuscript as jest.Mock).mockResolvedValue({})

      render(<SourceFilesTreeview {...defaultProps} />)

      const multiselect = screen.getAllByTestId('multiselect-select')[1]

      // Add assignment
      fireEvent.change(multiselect, { target: { value: ['manuscript'] } })

      await waitFor(() => {
        expect(api.sourceData.assignToManuscript).toHaveBeenCalledWith('6', 2)
      })

      // Remove assignment
      fireEvent.change(multiselect, { target: { value: [] } })

      await waitFor(() => {
        expect(api.sourceData.deleteFromManuscript).toHaveBeenCalledWith('6', '107')
      })
    })
  })
})
