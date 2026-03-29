import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { store } from '../shadow/services/store.js';
import { syncManager } from '../shadow/services/SyncManager.js';
import { eventBus, EVENTS } from '../shadow/services/EventBus.js';
import { bridgeService } from '../shadow/services/ShadowBridgeService.js';
import { setupBridgeMock } from './mocks/bridge-mock.js';

/**
 * Store-szinkronizációs fegyelem Tesztek (ADR-03 / Story 2.2)
 * Biztosítja a "Store-First" megközelítést és az aszinkron mentést.
 */
describe('Store Sync Discipline & SyncManager', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
    store.mode = 'bridge';
    store.projectTitle = 'Initial Title';
    store.isSyncing = false;
    store.lastSyncError = null;
    
    // Inicializáljuk a menedzsert
    syncManager.init();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    syncManager.disposal();
    eventBus.listeners.clear();
    bridgeService.disposal();
  });

  describe('State Management', () => {
    it('isSyncing állapot reagál a SYNC eseményekre', () => {
      expect(store.isSyncing).toBe(false);
      
      eventBus.emit(EVENTS.SYNC_START, {});
      expect(store.isSyncing).toBe(true);
      
      eventBus.emit(EVENTS.SYNC_SUCCESS, {});
      expect(store.isSyncing).toBe(false);
    });

    it('SYNC_ERROR esetén hibaüzenet és állapot frissítés történik', () => {
      eventBus.emit(EVENTS.SYNC_ERROR, { error: 'Hálózati Hiba' });
      
      expect(store.isSyncing).toBe(false);
      expect(store.lastSyncError).toBe('Hálózati Hiba');
      expect(store.toastMessage).toContain('Hálózati Hiba');
    });
  });

  describe('Automatic Sync (ADR-03)', () => {
    it('Alapvető Store módosítás kiváltja a mentést (debounce)', async () => {
      // Mockoljuk a bridgeService mentési metódusát
      const saveSpy = vi.spyOn(bridgeService, 'saveBlueprint').mockResolvedValue({ success: true });
      
      // Módosítunk egy szinkron-köteles mezőt
      store.projectTitle = 'Updated Title';
      
      // Azonnal még nem hívódik meg (debounce vár 2000ms-ig)
      expect(saveSpy).not.toHaveBeenCalled();
      
      // Megfuttatjuk az időt
      vi.advanceTimersByTime(2100);
      
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Updated Title'
      }));
      expect(store.needsSync).toBe(true);
    });

    it('A blueprint szöveg módosítása a saveMasterBlueprint metódust hívja meg', async () => {
      const masterSpy = vi.spyOn(bridgeService, 'saveMasterBlueprint').mockResolvedValue({ success: true });
      
      store.blueprint = 'Új Blueprint Tartalom';
      vi.advanceTimersByTime(2100);
      
      expect(masterSpy).toHaveBeenCalledWith('Új Blueprint Tartalom');
    });

    it('Többféle módosítás esetén mindkét mentési metódus meghívódik', async () => {
      const saveSpy = vi.spyOn(bridgeService, 'saveBlueprint').mockResolvedValue({ success: true });
      const masterSpy = vi.spyOn(bridgeService, 'saveMasterBlueprint').mockResolvedValue({ success: true });
      
      store.projectTitle = 'Új Cím';
      store.blueprint = 'Új Szöveg';
      
      // Idő feltekerése a debounce-hoz
      vi.advanceTimersByTime(2100);
      
      // Megvárjuk az aszinkron hívásokat (microtasks)
      await Promise.resolve(); // performSync indítása
      await Promise.resolve(); // saveMasterBlueprint befejezése
      await Promise.resolve(); // saveBlueprint befejezése
      
      expect(saveSpy).toHaveBeenCalled();
      expect(masterSpy).toHaveBeenCalled();
    });

    it('Passive módban tilos az automatikus szinkronizáció', () => {
      const saveSpy = vi.spyOn(bridgeService, 'saveBlueprint');
      store.mode = 'passive';
      
      store.projectTitle = 'Offline Change';
      vi.advanceTimersByTime(2100);
      
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
});
