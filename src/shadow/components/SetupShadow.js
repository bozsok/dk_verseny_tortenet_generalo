import { BaseComponent } from './BaseComponent.js';
import { store } from '../services/store.js';

/**
 * SHADOW SETUP COMPONENT (V5 - ULTRA PASSIVE)
 * Kizárólag a sidebar belső HTML tartalmáért és az inputok szinkronizációjáért felel.
 * NINCS globális renderelés, NINCS Témaváltó kezelés, NINCS Bridge ikon kezelés.
 * Az eseményeket a RootShadow kezeli központilag.
 */
export class SetupShadow extends BaseComponent {
  constructor() {
    super();
    this._initSubscriptions();
  }

  _initSubscriptions() {
    // Csak a SAJÁT tartalmát érintő változásokra iratkozik fel
    store.subscribe('sidebarCollapsed', () => this.update('sidebarCollapsed'));
    store.subscribe('projectTitle', (val) => this.update('projectTitle', val));
    store.subscribe('prompt', (val) => this.update('prompt', val));
    store.subscribe('isGenerating', () => this.update('status'));
    store.subscribe('isWaitingForNarrative', () => this.update('status'));
  }

  render() {
    const isLocked = store.isGenerating || store.isWaitingForNarrative;
    const disabledAttr = isLocked ? 'disabled' : '';
    const lockedBtnClass = isLocked ? 'dkv-shadow-btn--disabled' : '';
    const isCollapsed = store.sidebarCollapsed;

    return `
      <div class="dkv-shadow-setup">
          <!-- Összecsukott nézet (Ikonok) -->
          <!-- Összecsukott nézet (Ikonok) -->
          <div id="sidebar-icons" class="dkv-shadow-sidebar__icons dkv-shadow-fade-in ${isCollapsed ? '' : 'dkv-shadow-hidden'}">
            <button class="dkv-shadow-icon-btn dkv-shadow-icon-btn--primary" data-action="generate" title="AI-generálás" type="button">🤖</button>
          </div>

          <!-- Kiterjesztett nézet (Inputok) -->
          <div id="sidebar-inputs" class="dkv-shadow-setup-content dkv-shadow-fade-in ${isCollapsed ? 'dkv-shadow-hidden' : ''}">
            <div class="dkv-shadow-input-block">
              <label class="dkv-shadow-label">PROJEKT CÍME (TÖRTÉNET NEVE)</label>
              <input id="input-title" type="text" class="dkv-shadow-input" placeholder="pl. Kód Királyság: Az Utolsó Kernel" value="${store.projectTitle || ''}" ${disabledAttr}>
            </div>

            <div class="dkv-shadow-input-block">
              <label class="dkv-shadow-label">NARRATÍVA-KONCEPTUS ÉS FINOMHANGOLÁS</label>
              <textarea id="prompt-input" class="dkv-shadow-textarea dkv-shadow-textarea--medium" placeholder="Írd le a történet alapötletét vagy fűzz hozzá globális kéréseket..." ${disabledAttr}>${store.prompt || ''}</textarea>
            </div>

            <div class="dkv-shadow-sidebar__actions">
              <button id="generate-btn" type="button" data-action="generate" class="dkv-shadow-btn dkv-shadow-btn--primary ${lockedBtnClass}" ${disabledAttr}>
                ${isLocked ? 'GENERÁLÁS FOLYAMATBAN...' : 'AI-GENERÁLÁS INDÍTÁSA'}
              </button>
              
              <button id="load-story-btn" type="button" data-action="load-story" class="dkv-shadow-btn dkv-shadow-btn--secondary ${lockedBtnClass}" ${disabledAttr}>
                TÖRTÉNET BETÖLTÉSE
              </button>

              ${store.needsSync && store.isBridgeOnline ? `
                <button id="sync-project-btn" data-action="sync-project" class="dkv-shadow-btn dkv-shadow-btn--sync ${lockedBtnClass}" ${disabledAttr}>
                  SZINKRONIZÁCIÓ A PROJEKTBE
                </button>
              ` : ''}
            </div>

          </div>
      </div>
    `.trim();
  }

  mount(container) {
    if (!container) return;
    this.element = container;
    this.element.innerHTML = this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const titleInput = this.element.querySelector('#input-title');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        if (this._titleTimeout) clearTimeout(this._titleTimeout);
        this._titleTimeout = setTimeout(() => {
          store.projectTitle = e.target.value;
        }, 300);
      });
    }

    const promptInput = this.element.querySelector('#prompt-input');
    if (promptInput) {
      promptInput.addEventListener('input', (e) => {
        if (this._promptTimeout) clearTimeout(this._promptTimeout);
        this._promptTimeout = setTimeout(() => {
          store.prompt = e.target.value;
        }, 300);
      });
    }
  }

  destroy() {
    if (this._titleTimeout) clearTimeout(this._titleTimeout);
    if (this._promptTimeout) clearTimeout(this._promptTimeout);
    super.destroy();
  }

  _toggleSidebar() {
    const isCollapsing = !store.sidebarCollapsed;
    if (isCollapsing) {
      store.sidebarContentVisible = false;
      setTimeout(() => {
        store.sidebarCollapsed = true;
        setTimeout(() => { store.sidebarIconsVisible = true; }, 400);
      }, 300);
    } else {
      store.sidebarIconsVisible = false;
      setTimeout(() => {
        store.sidebarCollapsed = false;
        setTimeout(() => { store.sidebarContentVisible = true; }, 400);
      }, 300);
    }
  }

  update(property, value) {
    if (!this.element) return;

    // 1. Célzott input frissítések (Fidality Guard - Rule 61)
    if (property === 'projectTitle') {
      this.updateElement('#input-title', value, 'value');
    }

    if (property === 'prompt') {
      this.updateElement('#prompt-input', value, 'value');
    }

    // 2. Sidebar állapot (Targeted Toggle - Rule 60)
    if (property === 'sidebarCollapsed') {
      const isCollapsed = value;
      const icons = this.element.querySelector('#sidebar-icons');
      const inputs = this.element.querySelector('#sidebar-inputs');
      const toggleBtn = this.element.querySelector('#sidebar-toggle');
      const headerText = this.element.querySelector('.dkv-shadow-sidebar__header-text');

      if (icons) icons.classList.toggle('dkv-shadow-hidden', !isCollapsed);
      if (inputs) inputs.classList.toggle('dkv-shadow-hidden', isCollapsed);
      if (toggleBtn) toggleBtn.textContent = isCollapsed ? '»' : '«';
      if (headerText) headerText.textContent = isCollapsed ? '' : 'PROJEKT PARAMÉTEREK';
    }

    // 3. Status frissítések (Gombok és inputok tiltása)
    if (property === 'status') {
      const isLocked = store.isGenerating || store.isWaitingForNarrative;

      // Gombok és inputok állapotának frissítése
      this.element.querySelectorAll('button, input, textarea').forEach(el => {
        if (el.id !== 'sidebar-toggle') el.disabled = isLocked;
      });

      // Gombfelirat frissítése célzottan
      const btnText = store.isGenerating
        ? 'GENERÁLÁS FOLYAMATBAN...'
        : (store.isWaitingForNarrative ? 'VÁRAKOZÁS AI-RA...' : 'AI-GENERÁLÁS INDÍTÁSA');

      this.updateElement('#generate-btn', btnText, 'textContent');

      // Class-ok frissítése
      const genBtn = this.element.querySelector('#generate-btn');
      const loadBtn = this.element.querySelector('#load-story-btn');
      if (genBtn) genBtn.classList.toggle('dkv-shadow-btn--disabled', isLocked);
      if (loadBtn) loadBtn.classList.toggle('dkv-shadow-btn--disabled', isLocked);
    }
  }
}
