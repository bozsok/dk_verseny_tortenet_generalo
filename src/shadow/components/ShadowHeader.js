import { BaseComponent } from './BaseComponent.js';
import { store } from '../services/store.js';
import { themeManager } from '../services/ThemeManager.js';

/**
 * SHADOW HEADER COMPONENT (V5)
 * Felelős a projekt címének, a Bridge állapotának és a téma váltónak a kijelzéséért.
 * Megvalósítja az FR18-as vizuális állapotjelzést.
 */
export class ShadowHeader extends BaseComponent {
  constructor() {
    super();
    this._initSubscriptions();
  }

  _initSubscriptions() {
    this._unsubscribers = [];
    // Figyeljük a projekt címét, a bridge státuszt és a témát
    this._unsubscribers.push(store.subscribe('projectTitle', (val) => this.handleUpdate('projectTitle', val)));
    this._unsubscribers.push(store.subscribe('isBridgeOnline', (val) => this.handleUpdate('bridgeStatus', val)));
    this._unsubscribers.push(store.subscribe('theme', () => this.handleUpdate('theme')));
  }

  destroy() {
    if (this._unsubscribers) {
      this._unsubscribers.forEach(unsub => unsub());
    }
    super.destroy();
  }

  render() {
    const isOnline = store.isBridgeOnline;
    const projectTitle = store.projectTitle || 'NÉVTELEN PROJEKT';
    const themeIcon = store.theme === 'cyber-fantasy' ? 'light_mode' : 'dark_mode';

    return `
      <header class="dkv-shadow-header">
        <div style="display: flex; align-items: center; overflow: hidden; gap: 5px;">
          <span class="dkv-shadow-bridge-indicator ${isOnline ? 'dkv-shadow-bridge-indicator--online' : 'dkv-shadow-bridge-indicator--offline'}" 
                title="${isOnline ? 'Bridge online' : 'Bridge offline'}"></span>
          <h1 class="dkv-shadow-header__title">TÖRTÉNET: ${projectTitle}</h1>
        </div>
        
        <div class="dkv-shadow-header__actions">
          <button id="header-theme-toggle" class="dkv-shadow-nav-btn" title="Téma váltása" type="button" style="background: none; border: none; color: inherit; cursor: pointer; display: flex;">
            <span class="material-symbols-outlined">${themeIcon}</span>
          </button>
          <button class="dkv-shadow-nav-btn" data-action="scroll-top" title="Ugrás az elejére" type="button" style="background: none; border: none; color: inherit; cursor: pointer; padding: 5px 10px; font-weight: bold;">↑</button>
        </div>
      </header>
    `.trim();
  }

  setupEventListeners() {
    const themeBtn = this.element.querySelector('#header-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeManager.toggleTheme();
      });
    }
  }

  handleUpdate(property, value) {
    if (!this.element) return;

    if (property === 'projectTitle') {
      const titleEl = this.element.querySelector('.dkv-shadow-header__title');
      if (titleEl) titleEl.textContent = `TÖRTÉNET: ${value || 'NÉVTELEN PROJEKT'}`;
    }
    
    if (property === 'bridgeStatus') {
      const indicator = this.element.querySelector('.dkv-shadow-bridge-indicator');
      if (indicator) {
        indicator.className = `dkv-shadow-bridge-indicator ${value ? 'dkv-shadow-bridge-indicator--online' : 'dkv-shadow-bridge-indicator--offline'}`;
        indicator.title = value ? 'Bridge online' : 'Bridge offline';
      }
    }

    if (property === 'theme') {
      const icon = this.element.querySelector('#header-theme-toggle span');
      if (icon) icon.textContent = store.theme === 'cyber-fantasy' ? 'light_mode' : 'dark_mode';
    }
  }
}
