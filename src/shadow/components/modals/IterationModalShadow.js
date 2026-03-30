import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW ITERATION MODAL (Zéró innerHTML)
 * Kezeli az egyes diák finomhangolását.
 * 5. fázis: Teljes CSS-izoláció (dkv-shadow- prefix).
 */
export class IterationModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('editingSlideId', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="iteration-modal" class="dkv-shadow-modal-overlay" data-action="close-iteration">
        <div class="dkv-shadow-modal-card dkv-shadow-modal-card--cyan dkv-shadow-fade-in-up">
          <div class="dkv-shadow-modal-header">
            <h2 id="iteration-modal-title" class="dkv-shadow-neon-text dkv-shadow-modal-title--reading">A dia finomhangolása</h2>
            <button id="close-iteration" class="dkv-shadow-close-btn" data-action="close-iteration">&times;</button>
          </div>
          
          <div class="dkv-shadow-modal-body">
            <p id="iteration-slide-info" class="dkv-shadow-modal-info"><strong>Dia:</strong> </p>
            <div class="dkv-shadow-input-block">
              <label class="dkv-shadow-label">MEGJEGYZÉS AZ AI SZÁMÁRA (Mit javítson?)</label>
              <textarea id="iteration-note" class="dkv-shadow-textarea dkv-shadow-textarea--iteration" placeholder="Pl. Legyen sötétebb a hangulat..."></textarea>
            </div>
          </div>

          <div class="dkv-shadow-modal-footer">
            <button id="save-iteration" class="dkv-shadow-btn dkv-shadow-btn--primary" data-action="save-iteration" style="width: auto; padding: 0 40px;">
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
      
      if (isVisible) {
        this.element.classList.add('dkv-shadow-modal-overlay--visible');
        this.element.classList.remove('dkv-shadow-modal-overlay--closing');

        const index = store.narrative.findIndex(s => s.id === value);
        if (index === -1) return;
        const slide = store.narrative[index];
        const isHero = index === 0 || index === store.narrative.length - 1;

        // Cím és infó frissítése
        const titleEl = this.element.querySelector('#iteration-modal-title');
        if (titleEl) {
          titleEl.classList.toggle('dkv-shadow-modal-title--hero', isHero);
          titleEl.classList.toggle('dkv-shadow-modal-title--small', !isHero);
        }

        const infoEl = this.element.querySelector('#iteration-slide-info');
        if (infoEl) infoEl.textContent = `Dia: ${slide.title}`;

        const textarea = this.element.querySelector('#iteration-note');
        if (textarea) textarea.value = slide.notes || '';
      } else {
        this.element.classList.remove('dkv-shadow-modal-overlay--visible');
      }
    }
  }
}
