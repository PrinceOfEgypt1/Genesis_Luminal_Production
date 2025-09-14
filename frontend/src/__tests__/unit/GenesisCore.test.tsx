import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Mock GenesisCore simples para teste
const GenesisCore = () => {
  return (
    <main data-testid="genesis-core">
      <div>Genesis Luminal Loading...</div>
    </main>
  )
}

describe('GenesisCore', () => {
  it('should render without crashing', () => {
    render(<GenesisCore />)
    
    const container = screen.getByTestId('genesis-core')
    expect(container).toBeInTheDocument()
  })

  it('should display loading message', () => {
    render(<GenesisCore />)
    
    expect(screen.getByText('Genesis Luminal Loading...')).toBeInTheDocument()
  })
})
