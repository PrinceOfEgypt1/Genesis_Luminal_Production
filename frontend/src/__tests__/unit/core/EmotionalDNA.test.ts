import { describe, it, expect, beforeEach } from 'vitest'
import { EmotionalDNA } from '../../../core/EmotionalDNA'

describe('EmotionalDNA', () => {
  let emotionalDNA: EmotionalDNA

  beforeEach(() => {
    emotionalDNA = new EmotionalDNA({ energy: 0.5, valence: 0.5, arousal: 0.5 })
  })

  describe('Basic Properties', () => {
    it('should initialize with valid energy values', () => {
      expect(emotionalDNA.getEnergy()).toBeGreaterThanOrEqual(0)
      expect(emotionalDNA.getEnergy()).toBeLessThanOrEqual(1)
    })

    it('should create different instances with different energy', () => {
      const dna1 = new EmotionalDNA()
      const dna2 = new EmotionalDNA()
      
      // Very unlikely to be exactly the same
      expect(dna1.getEnergy()).not.toBe(dna2.getEnergy())
      expect(dna1.getEnergy()).toBeGreaterThanOrEqual(0)
      expect(dna2.getEnergy()).toBeLessThanOrEqual(1)
    })
  })

  describe('Energy Management', () => {
    it('should set and get energy correctly', () => {
      const initialEnergy = emotionalDNA.getEnergy()
      
      emotionalDNA.setEnergy(0.8)
      
      expect(emotionalDNA.getEnergy()).toBe(0.8)
      expect(emotionalDNA.getEnergy()).not.toBe(initialEnergy)
      
      // Test boundary conditions
      emotionalDNA.setEnergy(1.5) // Above max
      expect(emotionalDNA.getEnergy()).toBe(1)
      
      emotionalDNA.setEnergy(-0.5) // Below min
      expect(emotionalDNA.getEnergy()).toBe(0)
    })

    it('should set and get valence correctly', () => {
      emotionalDNA.setValence(0.7)
      expect(emotionalDNA.getValence()).toBe(0.7)
      
      emotionalDNA.setValence(1.2)
      expect(emotionalDNA.getValence()).toBe(1)
      
      emotionalDNA.setValence(-0.1)
      expect(emotionalDNA.getValence()).toBe(0)
    })

    it('should set and get arousal correctly', () => {
      const testValue = 0.6
      emotionalDNA.setArousal(testValue)
      
      expect(emotionalDNA.getArousal()).toBe(testValue)
    })
  })

  describe('Emotional Intensity', () => {
    it('should calculate emotional intensity correctly', () => {
      emotionalDNA.setEnergy(0.8)
      emotionalDNA.setValence(0.6)
      emotionalDNA.setArousal(0.7)
      
      const intensity = emotionalDNA.getEmotionalIntensity()
      expect(intensity).toBeGreaterThan(0)
      expect(intensity).toBeLessThanOrEqual(1)
    })
  })

  describe('Coherence Calculation', () => {
    it('should calculate coherence between two EmotionalDNA instances', () => {
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
  })

  describe('JSON Serialization', () => {
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
        energy: 0.9,
        valence: 0.2,
        arousal: 0.7,
        timestamp: Date.now()
      }
      
      const newDNA = EmotionalDNA.fromJSON(jsonData)
      
      expect(newDNA.getEnergy()).toBe(0.9)
      expect(newDNA.getValence()).toBe(0.2)
      expect(newDNA.getArousal()).toBe(0.7)
    })
  })
})

