import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bridgeService } from '../shadow/services/ShadowBridgeService.js';
import { store } from '../shadow/services/store.js';
import { setupBridgeMock } from './mocks/bridge-mock.js';

/**
 * Hibrid Offline Fallback Unit Tesztek
 * Validálja, hogy Passive módban a rendszer a belső Shadow adatokat használja.
 */
describe('Offline Fallback (Passive Mode)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Teszteljük a Passive módot
    store.mode = 'passive';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    bridgeService.disposal();
  });

  it('Passive módban a getNarrative a belső Shadow adatokat adja vissza', async () => {
    const fetchSpy = setupBridgeMock({ '/get-narrative': { narrative: [] } });
    
    const narrative = await bridgeService.getNarrative();
    
    // Szigorú elvárás: nem történhet hálózati kérés
    expect(fetchSpy).not.toHaveBeenCalled();
    
    // Ellenőrizzük, hogy a betöltött adat struktúrája helyes
    expect(Array.isArray(narrative)).toBe(true);
    expect(narrative.length).toBeGreaterThan(0);
    expect(narrative[0]).toHaveProperty('id');
    expect(narrative[0]).toHaveProperty('title');
  });

  it('Passive módban a projekt adatok is helyiből jönnek', async () => {
    const fetchSpy = setupBridgeMock({ '/get-project-data': {} });
    
    const data = await bridgeService.getProjectData();
    
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('prompt');
  });

  it('Passive módban a mentés (POST) tiltott és hibát dob', async () => {
    const testData = { title: 'Új történet' };
    
    await expect(bridgeService.saveBlueprint(testData))
      .rejects.toThrow('Művelet nem engedélyezett Passive módban.');
      
    await expect(bridgeService.saveIteration('s1', 'note'))
      .rejects.toThrow('Művelet nem engedélyezett Passive módban.');
  });

  it('Bridge módban a rendszer továbbra is a 3003-as portot preferálja', async () => {
    store.mode = 'bridge';
    const mockNarrative = { 
      success: true, 
      narrative: [{ id: 'br-1', title: 'Bridge Slide', content: '...' }] 
    };
    const fetchSpy = setupBridgeMock({ '/get-narrative': mockNarrative });
    
    const narrative = await bridgeService.getNarrative();
    
    expect(fetchSpy).toHaveBeenCalled();
    expect(narrative[0].title).toBe('Bridge Slide');
  });
});
