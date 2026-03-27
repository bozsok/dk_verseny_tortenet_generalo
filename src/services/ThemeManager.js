import { store, subscribe } from './store.js';
import { Logger } from './Logger.js';

/**
 * A témák kezeléséért felelős osztály.
 * Alkalmazza a stílusokat és kezeli a perzisztenciát.
 */
class ThemeManager {
  constructor() {
    this.init();
  }

  /**
   * Inicializálja a témakezelőt.
   */
  init() {
    // Feliratkozás a store változásaira
    subscribe((prop, value) => {
      if (prop === 'theme') {
        this.applyTheme(value);
      }
    });

    // Kezdeti állapot beállítása
    this.applyTheme(store.theme);
    Logger.info(`ThemeManager: Inicializálva, aktuális téma: ${store.theme}`);
  }

  /**
   * Alkalmazza a témát a DOM-ra.
   * @param {string} theme - A téma neve.
   */
  applyTheme(theme) {
    if (!theme) return;
    Logger.info(`ThemeManager: Téma alkalmazása -> ${theme}`);
    // Beállítjuk a data-theme attribútumot az elemeken
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;

    // Elmentjük a preferenciát
    try {
      localStorage.setItem('dkv_theme', theme);
    } catch (err) {
      Logger.warn('ThemeManager: LocalStorage nem érhető el a téma mentéséhez.', err);
    }

    Logger.debug(`ThemeManager: Téma alkalmazva: ${theme}`);
  }

  /**
   * Válogat a témák között.
   */
  toggleTheme() {
    const nextTheme = store.theme === 'cyber-fantasy' ? 'literary' : 'cyber-fantasy';
    Logger.info(`ThemeManager: Téma váltás -> ${nextTheme}`);
    store.theme = nextTheme;
  }
}

export const themeManager = new ThemeManager();
