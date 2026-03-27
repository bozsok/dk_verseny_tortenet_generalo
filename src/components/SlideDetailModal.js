import { store } from '../services/store.js';

/**
 * Megjeleníti egy adott dia részletes tartalmát egy olvasásra optimalizált modal ablakban.
 * @returns {string} HTML sablon.
 */
export const SlideDetailModal = () => {
  const index = store.narrative.findIndex(s => s.id === store.viewingSlideId);
  if (index === -1) return '';

  const slide = store.narrative[index];
  const isHero = index === 0 || index === store.narrative.length - 1;
  const titleClass = isHero ? 'dkv-modal-title--hero' : 'dkv-modal-title--small';

  return `
    <div id="slide-detail-modal" class="dkv-modal-overlay dkv-modal-overlay--visible" data-action="close-view-modal">
      <div class="dkv-modal-card dkv-modal-card--cyan">
        <div class="dkv-modal-header">
          <h2 class="dkv-neon-text dkv-modal-title--reading ${titleClass}">${slide.title}</h2>
          <button class="dkv-close-btn" data-action="close-view-modal">&times;</button>
        </div>
        
        <div class="dkv-modal-body dkv-modal-body--reading">
          ${slide.content.split('\n').map(p => `<p style="margin-bottom: 20px;">${p}</p>`).join('')}
        </div>

        <div class="dkv-modal-footer" style="display:none;"></div>
      </div>
    </div>
  `;
};
