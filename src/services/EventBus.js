import { Logger } from './Logger.js';

/**
 * Központi eseménykezelő busz (Pub/Sub minta).
 * Támogatja a feliratkozást, leiratkozást és egyszeri eseményeket.
 * Tartalmaz egy opcionális zárolási mechanizmust.
 */
class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
    /** @type {Function|null} */
    this.lockProvider = null;
  }

  /**
   * Beállítja a funkciót, amely megadja, hogy a busz éppen zárolva van-e.
   * @param {Function} provider - () => boolean típusú függvény.
   */
  setLockProvider(provider) {
    this.lockProvider = provider;
  }

  /**
   * Feliratkozás egy eseményre.
   * @param {string} event - Az esemény neve.
   * @param {Function} callback - A lefutó függvény.
   * @returns {Function} Leiratkozó függvény.
   */
  on(event, callback) {
    if (typeof callback !== 'function') return () => {};
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => this.off(event, callback);
  }

  /**
   * Egyszeri feliratkozás egy eseményre.
   * @param {string} event - Az esemény neve.
   * @param {Function} callback - A lefutó függvény.
   * @returns {Function} Leiratkozó függvény.
   */
  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  }

  /**
   * Leiratkozás egy eseményről.
   * @param {string} event - Az esemény neve.
   * @param {Function} callback - A függvény, amit el akarunk távolítani.
   */
  off(event, callback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Esemény kibocsátása.
   * @param {string} event - Az esemény neve.
   * @param {any} data - Az eseményhez tartozó adatok.
   */
  emit(event, data) {
    if (this.lockProvider && this.lockProvider()) {
      Logger.warn(`Event dropped (Navigation Lock active): ${event}`);
      // TODO: Implement visual feedback (toast) as requested in review
      this.emit('UI_REJECTED_ACTION', { event, reason: 'LOCK_ACTIVE' });
      return;
    }

    const set = this.listeners.get(event);
    if (!set) return;

    // Snapshot készítése a gyűjteményről az iteráció alatti módosítások ellen
    const snapshot = [...set];
    
    snapshot.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        Logger.error(`Error in EventBus listener for "${event}":`, error);
      }
    });
  }
}

export const eventBus = new EventBus();
