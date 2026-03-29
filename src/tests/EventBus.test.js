import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventBus, EVENTS } from '../shadow/services/EventBus.js';
import { bridgeService } from '../shadow/services/ShadowBridgeService.js';
import { themeManager } from '../shadow/services/ThemeManager.js';
import { store } from '../shadow/services/store.js';
import { setupBridgeMock } from './mocks/bridge-mock.js';

/**
 * ShadowEventBus & Pub-Sub Integrációs Tesztek (ADR-01 / Rule 61)
 */
describe('ShadowEventBus & Pub-Sub System', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
    store.mode = 'bridge';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Tisztítsuk meg a buszt a tesztek között (opcionális, mert singleton)
    eventBus.listeners.clear();
    bridgeService.disposal();
  });

  describe('EventBus Core', () => {
    it('Sikeres feliratkozás és eseménykibocsátás (emit)', () => {
      const callback = vi.fn();
      eventBus.on(EVENTS.THEME_CHANGE, callback);
      
      const testData = { theme: 'literary' };
      eventBus.emit(EVENTS.THEME_CHANGE, testData);
      
      expect(callback).toHaveBeenCalledWith(testData);
    });

    it('Leiratkozás (unsubscribe) megszünteti a figyelést', () => {
      const callback = vi.fn();
      const off = eventBus.on(EVENTS.SYNC_START, callback);
      
      off(); // Leiratkozás
      eventBus.emit(EVENTS.SYNC_START, { test: true });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('Egyszeri feliratkozás (once) csak egyszer fut le', () => {
      const callback = vi.fn();
      eventBus.once(EVENTS.SYNC_SUCCESS, callback);
      
      eventBus.emit(EVENTS.SYNC_SUCCESS, { id: 1 });
      eventBus.emit(EVENTS.SYNC_SUCCESS, { id: 2 });
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('Service Integrations', () => {
    it('ShadowBridgeService SYNC eseményeket bocsát ki mentéskor', async () => {
      setupBridgeMock({ '/save-blueprint': { success: true } });
      const startSpy = vi.fn();
      const successSpy = vi.fn();
      
      eventBus.on(EVENTS.SYNC_START, startSpy);
      eventBus.on(EVENTS.SYNC_SUCCESS, successSpy);
      
      await bridgeService.saveBlueprint({ title: 'Test Story' });
      
      expect(startSpy).toHaveBeenCalled();
      expect(successSpy).toHaveBeenCalledWith(expect.objectContaining({ action: 'saveBlueprint' }));
    });

    it('ShadowBridgeService SYNC_ERROR eseményt küld hiba esetén', async () => {
      // Szimulálunk egy hálózati hibát
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Fail')));
      
      const errorSpy = vi.fn();
      eventBus.on(EVENTS.SYNC_ERROR, errorSpy);
      
      try {
        await bridgeService.saveBlueprint({ title: 'Fail' });
      } catch (e) {
        // Várt hiba
      }
      
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ error: 'Network Fail' }));
    });

    it('ThemeManager THEME_CHANGE eseményt küld téma váltásakor', () => {
      const themeSpy = vi.fn();
      eventBus.on(EVENTS.THEME_CHANGE, themeSpy);
      
      themeManager.applyTheme('literary');
      
      expect(themeSpy).toHaveBeenCalledWith({ theme: 'literary' });
    });
  });
});
