import { Logger } from './Logger.js';
import { store } from './store.js';
import { SchemaValidator } from './SchemaValidator.js';
import { eventBus, EVENTS } from './EventBus.js';

// Statikus Shadow adatok - Kizárólag Passive módhoz (Rule: Shadow Only)
import { narrative as localNarrative } from '../data/narrative.js';
import localBlueprint from '../data/blueprint.json';
import localMaster from '../data/blueprint-master.json';

/**
 * ShadowBridgeService - A hálózati réteg izolált kezelője a Shadow rendszerben.
 * ADR-01 és Rule 60/61 alapján implementálva a 3003-as port felé.
 */
class ShadowBridgeService {
  constructor() {
    this.baseUrl = 'http://localhost:3003';
    this.timeoutMs = 5000; // NFR1 és Senior stabilitási réteg (Timeout protection)
    this.controllers = new Set();
  }

  /**
   * Központosított fetch hívás timeout és abort kezeléssel.
   * @param {string} endpoint - Az API végpont (pl. /health).
   * @param {Object} options - Fetch opciók.
   */
  async fetchWithTimeout(endpoint, options = {}, timeoutOverride = null) {
    const controller = new AbortController();
    this.controllers.add(controller);
    
    const timeout = timeoutOverride || this.timeoutMs;
    const timeoutId = setTimeout(() => {
      controller.abort();
      Logger.warn(`Bridge: Időtúllépés (timeout: ${timeout}ms) a(z) ${endpoint} végponton.`);
    }, timeout);
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Bridge Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      if (err.name === 'AbortError') {
        Logger.error(`Bridge: Kérés megszakítva vagy időtúllépés (timeout: ${timeout}ms) - ${endpoint}`);
      } else {
        Logger.error(`Bridge: Hálózati hiba a(z) ${endpoint} végponton:`, err.message);
      }
      throw err;
    } finally {
      this.controllers.delete(controller);
    }
  }

  /**
   * Ellenőrzi a Bridge szerver elérhetőségét.
   * @returns {Promise<boolean>}
   */
  async checkHealth(timeoutOverride = null) {
    try {
      const data = await this.fetchWithTimeout('/health', { 
        method: 'GET', 
        cache: 'no-cache' 
      }, timeoutOverride);
      return !!data;
    } catch (err) {
      return false;
    }
  }

  /**
   * Automatikus környezet-detektálás (Bridge vs. Passive mód).
   * NFR1: 500 ms alatti válaszidő kényszerítése.
   */
  async detectEnvironment() {
    Logger.info('Bridge: Környezetdetektálás indítása (500ms timeout)...');
    const isOnline = await this.checkHealth(500);
    
    store.isBridgeOnline = isOnline;
    store.mode = isOnline ? 'bridge' : 'passive';
    
    Logger.info(`Bridge: Detektálás kész. Állapot: ${isOnline ? 'ONLINE' : 'OFFLINE'}, Üzemmód: ${store.mode.toUpperCase()}`);
    return store.mode;
  }

  /**
   * Lekéri a Mesterleírót (Master Blueprint).
   * @returns {Promise<Object>}
   */
  async getMasterBlueprint() {
    let data;
    if (store.mode === 'passive') {
      Logger.info('Bridge: Mesterleíró betöltése helyi (Shadow) forrásból.');
      data = localMaster;
    } else {
      data = await this.fetchWithTimeout('/get-master-blueprint');
    }

    const validated = SchemaValidator.validateBlueprint(data);
    if (!validated) throw new Error('Shadow Error: Érvénytelen Mesterleíró struktúra (Adat-integritás hiba).');
    return validated;
  }

  /**
   * Lekéri a projekt metaadatait.
   * @returns {Promise<Object>}
   */
  async getProjectData() {
    let data;
    if (store.mode === 'passive') {
      Logger.info('Bridge: Projekt adatok betöltése helyi (Shadow) forrásból.');
      data = localBlueprint;
    } else {
      data = await this.fetchWithTimeout('/get-project-data');
    }

    const validated = SchemaValidator.validateProject(data);
    if (!validated) throw new Error('Shadow Error: Érvénytelen projekt metaadatok (Adat-integritás hiba).');
    return validated;
  }

  /**
   * Lekéri a generált narratívát és validálja a struktúrát.
   * @returns {Promise<Array>} Narratíva diák tömbje.
   */
  async getNarrative() {
    let rawNarrative = [];
    
    if (store.mode === 'passive') {
      Logger.info('Bridge: Narratíva betöltése helyi (Shadow) forrásból.');
      rawNarrative = localNarrative;
    } else {
      const data = await this.fetchWithTimeout('/get-narrative');
      if (data.success && Array.isArray(data.narrative)) {
        rawNarrative = data.narrative;
      }
    }

    // Közös séma-validáció és szűrés (Data Integrity - Rule 62 / NFR6)
    return rawNarrative
      .map(card => SchemaValidator.validateCard(card))
      .filter(card => card !== null);
  }

  /**
   * Új Blueprint mentése és generálás indítása.
   * @param {Object} data - { title, prompt, narrativeConfig }
   */
  async saveBlueprint(data) {
    if (store.mode === 'passive') throw new Error('Művelet nem engedélyezett Passive módban.');
    
    eventBus.emit(EVENTS.SYNC_START, { action: 'saveBlueprint' });
    try {
      const result = await this.fetchWithTimeout('/save-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      eventBus.emit(EVENTS.SYNC_SUCCESS, { action: 'saveBlueprint', result });
      return result;
    } catch (err) {
      eventBus.emit(EVENTS.SYNC_ERROR, { action: 'saveBlueprint', error: err.message });
      throw err;
    }
  }

  /**
   * Egyedi módosítás (iteráció) mentése.
   * @param {string} slideId 
   * @param {string} note 
   */
  async saveIteration(slideId, note) {
    if (store.mode === 'passive') throw new Error('Művelet nem engedélyezett Passive módban.');
    
    eventBus.emit(EVENTS.SYNC_START, { action: 'saveIteration', slideId });
    try {
      const result = await this.fetchWithTimeout('/save-iteration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId, note })
      });
      eventBus.emit(EVENTS.SYNC_SUCCESS, { action: 'saveIteration', slideId });
      return result;
    } catch (err) {
      eventBus.emit(EVENTS.SYNC_ERROR, { action: 'saveIteration', error: err.message });
      throw err;
    }
  }

  /**
   * Teljes projekt szinkronizálása (Mesterleíró és Narratíva).
   * @param {string} title 
   * @param {Array} narrative 
   */
  async syncFullProject(title, narrative) {
    if (store.mode === 'passive') return;
    
    eventBus.emit(EVENTS.SYNC_START, { action: 'syncFullProject' });
    try {
      const result = await this.fetchWithTimeout('/sync-full-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, narrative })
      });
      eventBus.emit(EVENTS.SYNC_SUCCESS, { action: 'syncFullProject' });
      return result;
    } catch (err) {
      eventBus.emit(EVENTS.SYNC_ERROR, { action: 'syncFullProject', error: err.message });
      throw err;
    }
  }

  /**
   * Kizárólag a Shadow-narratíva mentése.
   * @param {string} title 
   * @param {Array} narrative 
   */
  async saveShadowNarrative(title, narrative) {
    if (store.mode === 'passive') return;

    eventBus.emit(EVENTS.SYNC_START, { action: 'saveShadowNarrative' });
    try {
      const result = await this.fetchWithTimeout('/save-shadow-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, narrative })
      });
      eventBus.emit(EVENTS.SYNC_SUCCESS, { action: 'saveShadowNarrative' });
      return result;
    } catch (err) {
      eventBus.emit(EVENTS.SYNC_ERROR, { action: 'saveShadowNarrative', error: err.message });
      throw err;
    }
  }

  /**
   * Mesterleíró mentése.
   * Bridge módban: POST /save-master-blueprint
   * Passive módban: Helyi store-ba mentés (bridge nélkül is működik)
   * @param {string} blueprint 
   */
  async saveMasterBlueprint(blueprint) {
    // Passive módban helyi mentés (bridge nélkül is működjön)
    if (store.mode === 'passive') {
      store.blueprint = blueprint;
      Logger.info('Bridge: Mesterleíró helyi (Passive) mentése sikeres.');
      return { success: true, mode: 'passive' };
    }
    
    eventBus.emit(EVENTS.SYNC_START, { action: 'saveMasterBlueprint' });
    try {
      const result = await this.fetchWithTimeout('/save-master-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: 'V4', blueprint })
      });
      eventBus.emit(EVENTS.SYNC_SUCCESS, { action: 'saveMasterBlueprint' });
      return result;
    } catch (err) {
      eventBus.emit(EVENTS.SYNC_ERROR, { action: 'saveMasterBlueprint', error: err.message });
      throw err;
    }
  }

  /**
   * Megszakítja az összes folyamatban lévő hálózati kérést.
   * Kötelező hívni a DisposalService-en keresztül.
   */
  disposal() {
    if (this.controllers.size > 0) {
      Logger.info(`ShadowBridgeService: ${this.controllers.size} aktív kérés megszakítása...`);
      this.controllers.forEach(c => c.abort());
      this.controllers.clear();
    }
  }
}

export const bridgeService = new ShadowBridgeService();
