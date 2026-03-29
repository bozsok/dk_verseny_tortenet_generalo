import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW BLUEPRINT MODAL (Zéró innerHTML)
 * Kezeli a projekt alapvető leíróját.
 */
export class BlueprintModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('isEditingBlueprint', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="blueprint-modal" class="dkv-modal-overlay dkv-shadow-hidden" data-action="close-blueprint">
        <div class="dkv-modal-card dkv-modal-card--cyan dkv-fade-in-up">
          <div class="dkv-modal-header">
            <h2 class="dkv-neon-text dkv-modal-title--reading">Mesterleíró szerkesztő (Shadow)</h2>
            <button id="close-blueprint" class="dkv-close-btn" data-action="close-blueprint">&times;</button>
          </div>
          
          <div class="dkv-modal-body">
            <p class="dkv-modal-info dkv-modal-info--italic">
              Vigyázat: Itt az Árnyék-generátor alapvető logikáját módosíthatod.
            </p>
            <textarea id="blueprint-textarea" class="dkv-textarea dkv-textarea--large"
              placeholder="Blueprint tartalom ide..."
            >${store.blueprint || ''}</textarea>
          </div>

          <div class="dkv-modal-footer">
            <button id="save-blueprint" class="dkv-btn dkv-btn--secondary" style="width: auto; padding: 0 40px; border-color: var(--neon-cyan); color: var(--neon-cyan);">
              MENTÉS ÉS BEÉPÍTÉS
            </button>
          </div>
        </div>
      </div>
    `.trim();
  }

  handleUpdate(property, value) {
    if (property === 'visible') {
      this.element.classList.toggle('dkv-shadow-hidden', !value);
      if (value) {
        const textarea = this.element.querySelector('#blueprint-textarea');
        if (textarea) textarea.value = store.blueprint || '';
      }
    }
  }
}
