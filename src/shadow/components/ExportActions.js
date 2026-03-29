import { BaseComponent } from './BaseComponent.js';
import { store } from '../services/store.js';
import { eventBus, EVENTS } from '../services/EventBus.js';

/**
 * EXPORT ACTIONS COMPONENT (V5)
 * Felelős az exportálási és szinkronizációs gombok megjelenítéséért az oldalsávban.
 * Megvalósítja az AC 2 (EventBus) és Rule 60 (Disposal) szabályokat.
 */
export class ExportActions extends BaseComponent {
  constructor() {
    super();
    this._initSubscriptions();
  }

  _initSubscriptions() {
    this._unsub = [];
    // Figyeljük az állapotokat a gombok tiltásához/elrendezéséhez
    this._unsub.push(store.subscribe('isGenerating', () => this.handleUpdate('status')));
    this._unsub.push(store.subscribe('isWaitingForNarrative', () => this.handleUpdate('status')));
    this._unsub.push(store.subscribe('sidebarCollapsed', () => this.handleUpdate('sidebarCollapsed')));
  }

  destroy() {
    if (this._unsub) {
      this._unsub.forEach(fn => fn());
    }
    super.destroy();
  }

  setupEventListeners() {
    // AC 2: Az export gombok csak az EventBus-on keresztül kommunikálnak
    this.element.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      
      const action = btn.getAttribute('data-action');
      
      if (action === 'export-md') eventBus.emit(EVENTS.EXPORT_MD);
      else if (action === 'export-txt') eventBus.emit(EVENTS.EXPORT_TXT);
      else if (action === 'edit-blueprint') eventBus.emit(EVENTS.EDIT_BLUEPRINT);
      else if (action === 'sync-project') eventBus.emit(EVENTS.SYNC_PROJECT);
      
      // Megállítjuk a buborékolást (de-priorizált RootShadow delegáció)
      e.stopPropagation();
    });
  }

  render() {
    const isLocked = store.isGenerating || store.isWaitingForNarrative;
    const disabledAttr = isLocked ? 'disabled' : '';
    const lockedBtnClass = isLocked ? 'dkv-shadow-btn--disabled' : '';
    const isCollapsed = store.sidebarCollapsed;

    return `


      <div id="export-buttons" class="dkv-shadow-sidebar__secondary-actions dkv-shadow-fade-in ${isCollapsed ? 'dkv-shadow-hidden' : ''}">
        <button id="blueprint-btn" type="button" data-action="edit-blueprint" class="dkv-shadow-btn dkv-shadow-btn--secondary ${lockedBtnClass}" ${disabledAttr}>
          BLUEPRINT
        </button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
          <button id="export-md-btn" type="button" data-action="export-md" class="dkv-shadow-btn dkv-shadow-btn--accent ${lockedBtnClass}" ${disabledAttr} title="Markdown-exportálás">
            .MD
          </button>
          <button id="export-txt-btn" type="button" data-action="export-txt" class="dkv-shadow-btn dkv-shadow-btn--accent ${lockedBtnClass}" ${disabledAttr} title="Sima szöveges exportálás">
             .TXT
          </button>
        </div>
      </div>
    `.trim();
  }

  handleUpdate(property) {
    if (!this.element) return;
    
    // Status update (disabling buttons)
    if (property === 'status') {
       const isLocked = store.isGenerating || store.isWaitingForNarrative;
       this.element.querySelectorAll('button').forEach(btn => btn.disabled = isLocked);
       this.element.querySelectorAll('.dkv-shadow-btn').forEach(btn => btn.classList.toggle('dkv-shadow-btn--disabled', isLocked));
    }

    // Collapse toggle (Targeted - Rule 60)
    if (property === 'sidebarCollapsed') {
      const isCollapsed = store.sidebarCollapsed;
      const buttons = this.element.querySelector('#export-buttons');
      
      if (buttons) buttons.classList.toggle('dkv-shadow-hidden', isCollapsed);
    }
  }

  mount(container) {
    const parent = typeof container === 'string' ? document.querySelector(container) : container;
    if (!parent) return;

    this.element = document.createElement('div');
    this.element.className = 'dkv-shadow-export-actions-wrapper';
    this.element.innerHTML = this.render();
    
    parent.appendChild(this.element);
  }
}
