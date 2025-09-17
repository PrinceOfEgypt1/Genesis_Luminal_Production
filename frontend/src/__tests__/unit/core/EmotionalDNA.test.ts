import { describe, it, expect, beforeEach } from 'vitest'
import { EmotionalDNA } from '../../../core/entities/EmotionalDNA'

describe('EmotionalDNA', () => {
  let emotionalDNA: EmotionalDNA

  beforeEach(() => {
    emotionalDNA = new EmotionalDNA()
  })

  describe('initialization', () => {
    it('should create instance with default values', () => {
      expect(emotionalDNA).toBeInstanceOf(EmotionalDNA)
      expect(emotionalDNA.getEnergy()).toBeGreaterThanOrEqual(0)
      expect(emotionalDNA.getEnergy()).toBeLessThanOrEqual(1)
    })

    it('should initialize with random but stable values', () => {
      const dna1 = new EmotionalDNA()
      const dna2 = new EmotionalDNA()
      
      // Values should be different instances but within valid range
      expect(dna1.getEnergy()).not.toBe(dna2.getEnergy())
      expect(dna1.getEnergy()).toBeGreaterThanOrEqual(0)
      expect(dna2.getEnergy()).toBeLessThanOrEqual(1)
    })
  })

  describe('emotional state management', () => {
    it('should update energy levels', () => {
      const initialEnergy = emotionalDNA.getEnergy()
      
      emotionalDNA.setEnergy(0.8)
      
      expect(emotionalDNA.getEnergy()).toBe(0.8)
      expect(emotionalDNA.getEnergy()).not.toBe(initialEnergy)
    })

    it('should clamp energy values to valid range', () => {
      emotionalDNA.setEnergy(1.5) // Above max
      expect(emotionalDNA.getEnergy()).toBe(1)
      
      emotionalDNA.setEnergy(-0.5) // Below min
      expect(emotionalDNA.getEnergy()).toBe(0)
    })

    it('should update valence correctly', () => {
      emotionalDNA.setValence(0.7)
      expect(emotionalDNA.getValence()).toBe(0.7)
      
      emotionalDNA.setValence(1.2)
      expect(emotionalDNA.getValence()).toBe(1)
      
      emotionalDNA.setValence(-0.1)
      expect(emotionalDNA.getValence()).toBe(0)
    })

    it('should update arousal levels', () => {
      const testValue = 0.6
      emotionalDNA.setArousal(testValue)
      
      expect(emotionalDNA.getArousal()).toBe(testValue)
    })
  })

  describe('emotional calculations', () => {
    it('should calculate emotional intensity correctly', () => {
      emotionalDNA.setEnergy(0.8)
      emotionalDNA.setValence(0.6)
      emotionalDNA.setArousal(0.7)
      
      const intensity = emotionalDNA.getEmotionalIntensity()
      
      expect(intensity).toBeGreaterThan(0)
      expect(intensity).toBeLessThanOrEqual(1)
      expect(typeof intensity).toBe('number')
    })

    it('should calculate coherence between emotional states', () => {
      const otherDNA = new EmotionalDNA()
      otherDNA.setEnergy(0.5)
      otherDNA.setValence(0.5)
      otherDNA.setArousal(0.5)
      
      emotionalDNA.setEnergy(0.8)
      emotionalDNA.setValence(0.8)
      emotionalDNA.setArousal(0.8)
      
      const coherence = emotionalDNA.calculateCoherence(otherDNA)
      
      expect(coherence).toBeGreaterThanOrEqual(0)
      expect(coherence).toBeLessThanOrEqual(1)
    })

    it('should return perfect coherence with identical states', () => {
      const otherDNA = new EmotionalDNA()
      
      const testValues = { energy: 0.7, valence: 0.6, arousal: 0.8 }
      
      emotionalDNA.setEnergy(testValues.energy)
      emotionalDNA.setValence(testValues.valence)
      emotionalDNA.setArousal(testValues.arousal)
      
      otherDNA.setEnergy(testValues.energy)
      otherDNA.setValence(testValues.valence)
      otherDNA.setArousal(testValues.arousal)
      
      const coherence = emotionalDNA.calculateCoherence(otherDNA)
      
      expect(coherence).toBeCloseTo(1, 5)
    })
  })

  describe('evolution and learning', () => {
    it('should evolve based on user interaction', () => {
      const initialState = {
        energy: emotionalDNA.getEnergy(),
        valence: emotionalDNA.getValence(),
        arousal: emotionalDNA.getArousal()
      }
      
      const interaction = {
        type: 'positive',
        intensity: 0.8,
        duration: 1000
      }
      
      emotionalDNA.evolveFromInteraction(interaction)
      
      const newState = {
        energy: emotionalDNA.getEnergy(),
        valence: emotionalDNA.getValence(),
        arousal: emotionalDNA.getArousal()
      }
      
      // State should have changed
      const hasChanged = 
        newState.energy !== initialState.energy ||
        newState.valence !== initialState.valence ||
        newState.arousal !== initialState.arousal
      
      expect(hasChanged).toBe(true)
    })

    it('should adapt learning rate based on confidence', () => {
      const highConfidenceInteraction = {
        type: 'positive',
        intensity: 0.9,
        confidence: 0.95,
        duration: 500
      }
      
      const lowConfidenceInteraction = {
        type: 'positive',
        intensity: 0.9,
        confidence: 0.3,
        duration: 500
      }
      
      const dna1 = new EmotionalDNA()
      const dna2 = new EmotionalDNA()
      
      const initialEnergy1 = dna1.getEnergy()
      const initialEnergy2 = dna2.getEnergy()
      
      dna1.evolveFromInteraction(highConfidenceInteraction)
      dna2.evolveFromInteraction(lowConfidenceInteraction)
      
      const energyChange1 = Math.abs(dna1.getEnergy() - initialEnergy1)
      const energyChange2 = Math.abs(dna2.getEnergy() - initialEnergy2)
      
      // High confidence should lead to larger changes
      expect(energyChange1).toBeGreaterThanOrEqual(energyChange2)
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      emotionalDNA.setEnergy(0.7)
      emotionalDNA.setValence(0.8)
      emotionalDNA.setArousal(0.6)
      
      const json = emotionalDNA.toJSON()
      
      expect(json).toHaveProperty('energy', 0.7)
      expect(json).toHaveProperty('valence', 0.8)
      expect(json).toHaveProperty('arousal', 0.6)
      expect(json).toHaveProperty('timestamp')
    })

    it('should deserialize from JSON correctly', () => {
      const jsonData = {
        energy: 0.5,
        valence: 0.6,
        arousal: 0.7,
        timestamp: Date.now()
      }
      
      const newDNA = EmotionalDNA.fromJSON(jsonData)
      
      expect(newDNA.getEnergy()).toBe(0.5)
      expect(newDNA.getValence()).toBe(0.6)
      expect(newDNA.getArousal()).toBe(0.7)
    })
  })
})
