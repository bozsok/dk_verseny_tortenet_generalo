import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW BLUEPRINT MODAL (Zéró innerHTML)
 * Kezeli a projekt alapvető leíróját.
 * 5. fázis: Teljes CSS-izoláció (dkv-shadow- prefix).
 */
export class BlueprintModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('isEditingBlueprint', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="blueprint-modal" class="dkv-shadow-modal-overlay" data-action="close-blueprint">
        <div class="dkv-shadow-modal-card dkv-shadow-modal-card--cyan dkv-shadow-fade-in-up">
          <div class="dkv-shadow-modal-header">
            <h2 class="dkv-shadow-neon-text dkv-shadow-modal-title--reading">Mesterleíró szerkesztő</h2>
            <button id="close-blueprint" class="dkv-shadow-close-btn" data-action="close-blueprint">&times;</button>
          </div>
          
          <div class="dkv-shadow-modal-body">
            <p class="dkv-shadow-modal-info dkv-shadow-modal-info--italic">
              Vigyázat: Itt a generátor alapvető logikáját módosíthatod.
            </p>
            <textarea id="blueprint-textarea" class="dkv-shadow-textarea dkv-shadow-textarea--large"
              placeholder="Blueprint tartalom ide..."
            >${store.blueprint || ''}</textarea>
          </div>

          <div class="dkv-shadow-modal-footer">
            <button id="save-blueprint" class="dkv-shadow-btn dkv-shadow-btn--secondary" data-action="save-blueprint" style="width: auto; padding: 0 40px; border-color: var(--shadow-neon-cyan); color: var(--shadow-neon-cyan);">
              MENTÉS ÉS BEÉPÍTÉS
            </button>
          </div>
        </div>
      </div>
    `.trim();
  }

  handleUpdate(property, value) {
    if (property === 'visible') {
      if (value) {
        this.element.classList.add('dkv-shadow-modal-overlay--visible');
        this.element.classList.remove('dkv-shadow-modal-overlay--closing');
        const textarea = this.element.querySelector('#blueprint-textarea');
        if (textarea) textarea.value = store.blueprint || '';
      } else {
        this.element.classList.remove('dkv-shadow-modal-overlay--visible');
      }
    }
  }
}
