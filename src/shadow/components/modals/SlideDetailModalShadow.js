import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW SLIDE DETAIL MODAL (Zéró innerHTML)
 * Megjeleníti egy adott dia részletes tartalmát.
 * 5. fázis: Teljes CSS-izoláció (dkv-shadow- prefix).
 */
export class SlideDetailModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('viewingSlideId', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="slide-detail-modal" class="dkv-shadow-modal-overlay" data-action="close-view-modal">
        <div class="dkv-shadow-modal-card dkv-shadow-modal-card--cyan">
          <div class="dkv-shadow-modal-header">
            <h2 id="modal-title" class="dkv-shadow-neon-text dkv-shadow-modal-title--reading">Dia részletei</h2>
            <button class="dkv-shadow-close-btn" data-action="close-view-modal">&times;</button>
          </div>
          
          <div id="modal-body" class="dkv-shadow-modal-body dkv-shadow-modal-body--reading">
            <!-- Tartalom dinamikusan (Rule 60) -->
          </div>

          <div class="dkv-shadow-modal-footer" style="display:none;"></div>
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
        
        // Cím frissítése
        const titleEl = this.element.querySelector('#modal-title');
        if (titleEl) {
          titleEl.textContent = slide.title;
          titleEl.classList.toggle('dkv-shadow-modal-title--hero', isHero);
          titleEl.classList.toggle('dkv-shadow-modal-title--small', !isHero);
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
      } else {
        this.element.classList.remove('dkv-shadow-modal-overlay--visible');
      }
    }
  }
}
