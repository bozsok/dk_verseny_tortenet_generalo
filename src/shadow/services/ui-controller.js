import { store } from './store.js';
import { Logger } from './Logger.js';
import { disposalService } from './disposal-service.js';

/**
 * A fő alkalmazás eseménykezelőiért és akcióiért felelős kontroll osztály.
 */
export class UIController {
  /**
   * Inicializálja a globális eseménykezelőket.
   */
  static setupGlobalListeners() {
    Logger.info('UIController: Globális eseménykezelők beállítása...');

    // Regisztráció takarítással
    disposalService.addDisposableListener(window, 'keydown', this.handleGlobalKeydown);
  }

  /**
   * Kezeli a globális billentyűleütéseket.
   * @param {KeyboardEvent} e 
   */
  static handleGlobalKeydown(e) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      Logger.info('Gyorsmentés indítva (Ctrl+S)...');
      // Implementáció a Story 3.1-nél várható
    }
  }

  /**
   * Vágólapra másolja a megadott szöveget.
   * @param {string} text 
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      Logger.info('Sikeres vágólapra másolás.');
      return true;
    } catch (err) {
      Logger.error('Hiba a vágólapra másoláskor:', err);
      return false;
    }
  }

  /**
   * Sanitizálja a fájlnevet.
   * @param {string} str 
   * @returns {string}
   */
  static sanitizeFilename(str) {
    if (!str) return 'narrativa';
    return str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }
}
