import { Logger } from './Logger.js';

/**
 * Az alkalmazás erőforrásainak (eseménykezelők, időzítők, előfizetések) 
 * központi felszabadításáért felelős szolgáltatás.
 */
class DisposalService {
  constructor() {
    /** @type {Array<Function>} */
    this._cleanups = [];
  }

  /**
   * Regisztrál egy tetszőleges cleanup függvényt.
   * @param {Function} cleanupFn - A függvény, amit a purge során le kell futtatni.
   */
  add(cleanupFn) {
    if (typeof cleanupFn === 'function') {
      this._cleanups.push(cleanupFn);
    }
  }

  /**
   * Eseménykezelő hozzáadása regisztrált cleanup-pal.
   * @param {EventTarget} target - A cél elem (pl. window, document, HTMLElement).
   * @param {string} type - Az esemény típusa (pl. 'click', 'keydown').
   * @param {EventListenerOrEventListenerObject} listener - A kezelő függvény.
   * @param {boolean|AddEventListenerOptions} [options] - Opciók.
   */
  addDisposableListener(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    this.add(() => {
      target.removeEventListener(type, listener, options);
      Logger.debug(`DisposalService: Listener eltávolítva: ${type}`);
    });
  }

  /**
   * Végrehajtja az összes regisztrált cleanup folyamatot és üríti a listát.
   */
  purge() {
    Logger.info(`DisposalService: ${this._cleanups.length} cleanup folyamat indítása...`);
    this._cleanups.forEach((cleanup, index) => {
      try {
        cleanup();
      } catch (err) {
        Logger.error(`DisposalService: Hiba a(z) ${index}. cleanup során:`, err);
      }
    });
    this._cleanups = [];
    Logger.info('DisposalService: Minden erőforrás felszabadítva.');
  }

  /**
   * Singleton destroy (ha szükséges).
   */
  destroy() {
    this.purge();
  }
}

export const disposalService = new DisposalService();
