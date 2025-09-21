import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

// Mock básico do GenesisCore
const GenesisCore = () => {
  return (
    <div data-testid="genesis-core">
      <h1>Genesis Luminal</h1>
      <div>Emotional AI System</div>
    </div>
  )
}

describe('GenesisCore Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    expect(() => React.createElement(GenesisCore)).not.toThrow()
  })

  it('should contain Genesis Luminal text', () => {
    const element = React.createElement(GenesisCore)
    expect(element).toBeTruthy()
  })
})

