import { store } from '../services/store.js';

export const IterationModal = (slideId) => {
  const slide = store.narrative.find(s => s.id === slideId);
  if (!slide) return '';

  return `
    <div class="dkv-modal-overlay dkv-modal-overlay--visible">
      <div class="dkv-modal-card dkv-modal-card--cyan dkv-fade-in-up">
        <div class="dkv-modal-header">
          <h2 class="dkv-neon-text">A dia finomhangolása</h2>
          <button id="close-iteration" class="dkv-close-btn">&times;</button>
        </div>
        
        <div class="dkv-modal-body">
          <p class="dkv-modal-info"><strong>Dia:</strong> ${slide.title}</p>
          <div class="dkv-input-block">
            <label class="dkv-label">MEGJEGYZÉS AZ AI SZÁMÁRA (Mit javítson?)</label>
            <textarea id="iteration-note" class="dkv-textarea dkv-textarea--iteration" placeholder="Pl. Legyen sötétebb a hangulat...">${slide.notes || ''}</textarea>
          </div>
        </div>

        <div class="dkv-modal-footer">
          <button id="save-iteration" class="dkv-btn dkv-btn--primary" style="width: auto; padding: 0 40px;">
            VÉGREHAJTÁS
          </button>
        </div>
      </div>
    </div>
  `;
};
