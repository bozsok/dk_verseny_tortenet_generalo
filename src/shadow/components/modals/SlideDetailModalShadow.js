import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW SLIDE DETAIL MODAL (Zéró innerHTML)
 * Megjeleníti egy adott dia részletes tartalmát.
 */
export class SlideDetailModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('viewingSlideId', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="slide-detail-modal" class="dkv-modal-overlay dkv-shadow-hidden" data-action="close-view-modal">
        <div class="dkv-modal-card dkv-modal-card--cyan">
          <div class="dkv-modal-header">
            <h2 id="modal-title" class="dkv-neon-text dkv-modal-title--reading">Dia részletei</h2>
            <button class="dkv-close-btn" data-action="close-view-modal">&times;</button>
          </div>
          
          <div id="modal-body" class="dkv-modal-body dkv-modal-body--reading">
            <!-- Tartalom dinamikusan (Rule 60) -->
          </div>

          <div class="dkv-modal-footer" style="display:none;"></div>
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
        
        // Cím frissítése
        const titleEl = this.element.querySelector('#modal-title');
        if (titleEl) {
          titleEl.textContent = slide.title;
          titleEl.classList.toggle('dkv-modal-title--hero', isHero);
          titleEl.classList.toggle('dkv-modal-title--small', !isHero);
        }

        // Test frissítése (Rule 60: createElement + replaceChildren)
        const body = this.element.querySelector('#modal-body');
        if (body) {
          const fragment = document.createDocumentFragment();
          slide.content.split('\n').forEach(pText => {
            if (pText.trim()) {
              const p = document.createElement('p');
              p.style.marginBottom = '20px';
              p.textContent = pText;
              fragment.appendChild(p);
            }
          });
          body.replaceChildren(fragment);
        }
      }
    }
  }
}
