import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bridgeService } from '../shadow/services/ShadowBridgeService.js';
import { store } from '../shadow/services/store.js';
import { setupBridgeMock, setupDelayedBridgeMock } from './mocks/bridge-mock.js';

/**
 * ShadowBridgeService Unit Tesztek
 * NFR1, NFR4 és Rule 60/62 validálása.
 */
describe('ShadowBridgeService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Defaultban bridge módra állítjuk a hálózati tesztekhez
    store.mode = 'bridge';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    // Fontos: a singleton állapotát is ürítjük minden teszt előtt/után
    bridgeService.disposal();
  });

  it('checkHealth() - online állapot esetén true-t ad vissza', async () => {
    setupBridgeMock({ '/health': { status: 'ok' } });
    const isOnline = await bridgeService.checkHealth();
    expect(isOnline).toBe(true);
  });

  it('checkHealth() - hiba (404/500) esetén false-t ad vissza', async () => {
    setupBridgeMock({ '/health': { error: 'Not Found' } });
    const isOnline = await bridgeService.checkHealth();
    expect(isOnline).toBe(false);
  });

  it('getNarrative() - validálja és szűri a kapott diákat (Rule 62)', async () => {
    setupBridgeMock({
      '/get-narrative': {
        success: true,
        narrative: [
          { id: 's1', title: 'Valid Slide', content: '...' },
          { id: 's2' }, // Hiányzó title - szűrni kell
          null, // Érvénytelen elem - szűrni kell
          { id: 's3', title: 'Another Valid', content: 'Content' }
        ]
      }
    });
    const narrative = await bridgeService.getNarrative();
    expect(narrative.length).toBe(2);
    expect(narrative[0].title).toBe('Valid Slide');
    expect(narrative[1].id).toBe('s3');
  });

  it('disposal() - megszakítja a folyamatban lévő kéréseket (Rule 60)', async () => {
    // 2 másodperces késleltetés szimulálása
    setupDelayedBridgeMock(2000);
    
    const fetchPromise = bridgeService.getProjectData();
    
    // Azonnali disposal hívás
    bridgeService.disposal();
    
    // Mivel a kérés megszakadt, a promise-nak el kell buknia
    await expect(fetchPromise).rejects.toThrow();
  });

  it('timeout - megszakítja a kérést 5 másodperc után (Senior stabilitás)', async () => {
    // 10 másodperces késleltetés szimulálása
    setupDelayedBridgeMock(10000);
    
    const fetchPromise = bridgeService.getMasterBlueprint();
    
    // Idő előretekerése (triggereli a ShadowBridgeService belső timeoutját)
    vi.advanceTimersByTime(5500);
    
    await expect(fetchPromise).rejects.toThrow();
  });

  it('saveBlueprint() - helyesen küldi el az adatokat POST kéréssel', async () => {
    const fetchSpy = setupBridgeMock({ '/save-blueprint': { success: true } });
    const testData = { title: 'Test', prompt: 'Prompt' };
    
    await bridgeService.saveBlueprint(testData);
    
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/save-blueprint'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(testData)
      })
    );
  });
});
