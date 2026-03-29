import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW ITERATION MODAL (Zéró innerHTML)
 * Kezeli az egyes diák finomhangolását.
 */
export class IterationModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('editingSlideId', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="iteration-modal" class="dkv-modal-overlay dkv-shadow-hidden" data-action="close-iteration">
        <div class="dkv-modal-card dkv-modal-card--cyan dkv-fade-in-up">
          <div class="dkv-modal-header">
            <h2 id="iteration-modal-title" class="dkv-neon-text dkv-modal-title--reading">A dia finomhangolása (Shadow)</h2>
            <button id="close-iteration" class="dkv-close-btn" data-action="close-iteration">&times;</button>
          </div>
          
          <div class="dkv-modal-body">
            <p id="iteration-slide-info" class="dkv-modal-info"><strong>Dia:</strong> </p>
            <div class="dkv-input-block">
              <label class="dkv-label">MEGJEGYZÉS AZ AI SZÁMÁRA (Mit javítson?)</label>
              <textarea id="iteration-note" class="dkv-textarea dkv-textarea--iteration" placeholder="Pl. Legyen sötétebb a hangulat..."></textarea>
            </div>
          </div>

          <div class="dkv-modal-footer">
            <button id="save-iteration" class="dkv-btn dkv-btn--primary" style="width: auto; padding: 0 40px;">
              VÉGREHAJTÁS
            </button>
          </div>
        </div>
      </div>
    `.trim();
  }

  handleUpdate(property, value) {
    if (property === 'visible') {
      const isVisible = !!value;
      this.element.classList.toggle('dkv-shadow-hidden', !isVisible);
      
      if (isVisible) {
        const index = store.narrative.findIndex(s => s.id === value);
        if (index === -1) return;
        const slide = store.narrative[index];
        const isHero = index === 0 || index === store.narrative.length - 1;

        // Cím és infó frissítése
        const titleEl = this.element.querySelector('#iteration-modal-title');
        if (titleEl) {
          titleEl.classList.toggle('dkv-modal-title--hero', isHero);
          titleEl.classList.toggle('dkv-modal-title--small', !isHero);
        }

        const infoEl = this.element.querySelector('#iteration-slide-info');
        if (infoEl) infoEl.textContent = `Dia: ${slide.title}`;

        const textarea = this.element.querySelector('#iteration-note');
        if (textarea) textarea.value = slide.notes || '';
      }
    }
  }
}
