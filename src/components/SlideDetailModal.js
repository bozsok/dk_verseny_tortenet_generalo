import { store } from '../services/store.js';

/**
 * Megjeleníti egy adott dia részletes tartalmát egy olvasásra optimalizált modal ablakban.
 * @returns {string} HTML sablon.
 */
export const SlideDetailModal = () => {
  const slide = store.narrative.find(s => s.id === store.viewingSlideId);
  
  if (!slide) return '';

  return `
    <div id="slide-detail-modal" class="dkv-modal-overlay dkv-modal-overlay--visible" data-action="close-view-modal">
      <div class="dkv-modal-card dkv-modal-card--cyan dkv-fade-in-up">
        <div class="dkv-modal-header">
          <h2 class="dkv-neon-text dkv-modal-title--reading">${slide.title}</h2>
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
