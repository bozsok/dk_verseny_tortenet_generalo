import { store } from '../services/store.js';

export const BlueprintModal = () => {
  return `
    <div id="blueprint-modal" class="dkv-modal-overlay dkv-modal-overlay--visible" data-action="close-blueprint">
      <div class="dkv-modal-card dkv-modal-card--cyan dkv-fade-in-up">
        <div class="dkv-modal-header">
          <h2 class="dkv-neon-text dkv-modal-title--reading">Mesterleíró szerkesztő</h2>
          <button id="close-blueprint" class="dkv-close-btn">&times;</button>
        </div>
        
        <div class="dkv-modal-body">
          <p class="dkv-modal-info dkv-modal-info--italic">
            Vigyázat: Itt a generátor alapvető logikáját módosíthatod.
          </p>
          <textarea id="blueprint-textarea" class="dkv-textarea dkv-textarea--large"
            placeholder="Blueprint tartalom ide..."
          >${store.blueprint}</textarea>
        </div>

        <div class="dkv-modal-footer">
          <button id="save-blueprint" class="dkv-btn dkv-btn--secondary" style="width: auto; padding: 0 40px; border-color: var(--neon-cyan); color: var(--neon-cyan);">
            MENTÉS ÉS BEÉPÍTÉS
          </button>
        </div>
      </div>
    </div>
  `;
};
