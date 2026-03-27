import { store } from '../services/store.js';
import { themeManager } from '../services/ThemeManager.js';
import { Logger } from '../services/Logger.js';

/**
 * Téma váltó gomb komponens.
 * Megjelenít egy hold/nap ikont az aktuális téma alapján.
 */
export function ThemeToggle() {
  const isDark = store.theme === 'cyber-fantasy';
  const icon = isDark ? 'light_mode' : 'dark_mode';
  const label = isDark ? 'Világos téma' : 'Sötét téma';

  return `
    <button id="theme-toggle-btn" class="dkv-nav-btn dkv-theme-toggle" title="${label}">
      <span class="material-symbols-outlined">${icon}</span>
    </button>
  `;
}

/**
 * Eseménykezelők regisztrálása a ThemeToggle-hoz.
 */
export function initThemeToggleEvents() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.onclick = () => {
      Logger.debug('ThemeToggle: Kattintás észlelve.');
      themeManager.toggleTheme();
    };
  }
}
