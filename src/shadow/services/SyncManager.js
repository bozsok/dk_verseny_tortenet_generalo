import { store, subscribe } from './store.js';
import { eventBus, EVENTS } from './EventBus.js';
import { bridgeService } from './ShadowBridgeService.js';
import { Logger } from './Logger.js';

/**
 * SyncManager - A Store és a Bridge közötti aszinkron szinkronizációért felelős (ADR-03).
 * Megvalósítja az optimista frissítést és a háttérben történő mentést.
 */
class SyncManager {
  constructor() {
    this._unsubscribeStore = null;
    this._debounceTimeout = null;
    this._listeners = [];
    this._pendingChanges = new Set(); // Rule 61: Változások nyomon követése
  }

  /**
   * Inicializálja a szinkronizációs figyelőket.
   */
  init() {
    this.disposal(); // Biztonsági takarítás az esetleges dupla hívás ellen
    Logger.info('SyncManager: Inicializálás (ADR-03)...');
    
    // 1. EseményBusz figyelése a hálózati visszajelzésekhez
    this._listeners.push(eventBus.on(EVENTS.SYNC_START, () => {
      store.isSyncing = true;
      store.lastSyncError = null;
    }));

    this._listeners.push(eventBus.on(EVENTS.SYNC_SUCCESS, () => {
      store.isSyncing = false;
      store.needsSync = false;
      Logger.debug('SyncManager: Mentés sikeres.');
    }));

    this._listeners.push(eventBus.on(EVENTS.SYNC_ERROR, (data) => {
      store.isSyncing = false;
      store.lastSyncError = data.error || 'Ismeretlen hiba';
      // Hiba jelzése a felhasználónak (NFR: UI stabilitás)
      store.toastMessage = `Hiba a mentés során: ${store.lastSyncError}`;
      Logger.error(`SyncManager: Mentési hiba: ${store.lastSyncError}`);
    }));

    // 2. Store figyelése automatikus szinkronizációhoz
    this._unsubscribeStore = subscribe((prop) => {
      const syncFields = ['blueprint', 'projectTitle', 'prompt', 'narrativeConfig'];
      if (syncFields.includes(prop) && store.mode === 'bridge') {
        this._pendingChanges.add(prop);
        this.requestSync();
      }
    });

    Logger.info('SyncManager: Készen áll.');
  }

  /**
   * Szinkronizációs kérelem indítása debounce mechanizmussal.
   */
  requestSync() {
    store.needsSync = true;
    if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
    this._debounceTimeout = setTimeout(() => this.performSync(), 2000);
  }

  /**
   * Tényleges mentés végrehajtása a BridgeService-en keresztül.
   */
  async performSync() {
    if (store.mode === 'passive' || !store.needsSync) return;
    
    Logger.info('SyncManager: Mentés indítása...');
    const changes = new Set(this._pendingChanges);
    this._pendingChanges.clear();

    try {
      // 1. Mesterleíró mentése, ha változott
      if (changes.has('blueprint')) {
        await bridgeService.saveMasterBlueprint(store.blueprint);
      }
      
      // 2. Projekt adatok mentése, ha változtak
      if (changes.has('projectTitle') || changes.has('prompt') || changes.has('narrativeConfig')) {
        await bridgeService.saveBlueprint({
          title: store.projectTitle,
          prompt: store.prompt,
          narrativeConfig: { ...store.narrativeConfig }
        });
      }
    } catch (err) {
      // Hiba esetén visszaállítjuk a needsSync-et, ha maradt pending change
      if (this._pendingChanges.size > 0) store.needsSync = true;
    }
  }

  /**
   * Erőforrások felszabadítása (Rule 60).
   */
  disposal() {
    if (this._unsubscribeStore) this._unsubscribeStore();
    if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
    this._listeners.forEach(off => off());
    this._listeners = [];
    Logger.info('SyncManager: Erőforrások felszabadítva.');
  }
}

export const syncManager = new SyncManager();
