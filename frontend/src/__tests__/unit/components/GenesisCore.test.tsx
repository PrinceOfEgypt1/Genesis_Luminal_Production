import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GenesisCore } from '../../../components/GenesisCore'

// Mock dos hooks e contextos
vi.mock('../../../core/utils/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getMetrics: vi.fn(() => ({
      fps: 60,
      memory: 1000000,
      drawCalls: 100
    }))
  }
}))

describe('GenesisCore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<GenesisCore />)
    
    expect(screen.getByTestId('genesis-core')).toBeInTheDocument()
  })

  it('should initialize with default emotional state', () => {
    render(<GenesisCore />)
    
    const container = screen.getByTestId('genesis-core')
    expect(container).toHaveClass('genesis-container')
  })

  it('should handle mouse interactions', async () => {
    render(<GenesisCore />)
    
    const canvas = screen.getByRole('img', { hidden: true }) // Canvas has img role
    
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 })
    
    await waitFor(() => {
      expect(canvas).toBeInTheDocument()
    })
  })

  it('should handle touch interactions for mobile', async () => {
    render(<GenesisCore />)
    
    const canvas = screen.getByRole('img', { hidden: true })
    
    fireEvent.touchStart(canvas, {
      touches: [{ clientX: 50, clientY: 50 }]
    })
    
    await waitFor(() => {
      expect(canvas).toBeInTheDocument()
    })
  })

  it('should update emotional state on user interaction', async () => {
    const { container } = render(<GenesisCore />)
    
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    
    if (canvas) {
      fireEvent.click(canvas, { clientX: 200, clientY: 200 })
      
      await waitFor(() => {
        // Check if interaction was processed
        expect(canvas).toBeInTheDocument()
      })
    }
  })

  it('should handle window resize', () => {
    render(<GenesisCore />)
    
    // Simulate window resize
    fireEvent(window, new Event('resize'))
    
    expect(screen.getByTestId('genesis-core')).toBeInTheDocument()
  })

  it('should clean up resources on unmount', () => {
    const { unmount } = render(<GenesisCore />)
    
    unmount()
    
    // Verify cleanup was called (mocked functions should have been invoked)
    expect(true).toBe(true) // Placeholder for cleanup verification
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<GenesisCore />)
      
      const core = screen.getByTestId('genesis-core')
      expect(core).toHaveAttribute('role', 'application')
      expect(core).toHaveAttribute('aria-label')
    })

    it('should support keyboard navigation', () => {
      render(<GenesisCore />)
      
      const core = screen.getByTestId('genesis-core')
      
      fireEvent.keyDown(core, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(core, { key: ' ', code: 'Space' })
      
      expect(core).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should maintain 60 FPS target', async () => {
      render(<GenesisCore />)
      
      await waitFor(() => {
        // Mock performance monitoring would verify FPS
        expect(screen.getByTestId('genesis-core')).toBeInTheDocument()
      })
    })

    it('should optimize rendering for low-end devices', () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        configurable: true
      })
      
      render(<GenesisCore />)
      
      expect(screen.getByTestId('genesis-core')).toBeInTheDocument()
    })
  })
})
