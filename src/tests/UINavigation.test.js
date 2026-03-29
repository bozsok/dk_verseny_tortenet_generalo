import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NarrativeEngine } from '../shadow/services/narrative-engine.js';
import { store } from '../shadow/services/store.js';

describe('UI Navigáció Logika - NarrativeEngine', () => {
  beforeEach(() => {
    store.narrative = [];
    store.narrativeConfig = {
      onboardingCount: 3,
      introCount: 4,
      finaleCount: 3,
      stationCount: 5
    };
  });

  it('Generál 30 diás sztorihoz megfelelő szekciókat', () => {
    // 30 dia szimulálása
    const mockNarrative = Array.from({ length: 30 }, (_, i) => ({ id: `s-${i+1}`, title: `Slide ${i+1}` }));
    
    const sections = NarrativeEngine.getSections(mockNarrative);
    
    // Elvárt: Onboarding (3), Intro (4), Stations (5 * 4 = 20), Finale (3) = 30
    expect(sections.length).toBe(8); // On + Intro + 5 Stations + Finale
    expect(sections[0].id).toBe('sec-on');
    expect(sections[0].end).toBe(3);
    expect(sections[sections.length - 1].id).toBe('sec-fi');
    expect(sections[sections.length - 1].end).toBe(30);
  });

  it('Kezeli az üres narratívát is', () => {
    const sections = NarrativeEngine.getSections([]);
    expect(sections).toEqual([]);
  });

  it('Dinamikusan igazodik a kevesebb diához', () => {
    const mockNarrative = Array.from({ length: 10 }, (_, i) => ({ id: `s-${i+1}` }));
    const sections = NarrativeEngine.getSections(mockNarrative);
    
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[sections.length - 1].end).toBe(10);
  });
});
