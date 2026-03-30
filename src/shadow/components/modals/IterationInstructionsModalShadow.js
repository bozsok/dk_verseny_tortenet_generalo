import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW ITERATION INSTRUCTIONS MODAL (Zéró innerHTML)
 * AI iterációs instrukciók és prompt másolása a Végrehajtás gomb megnyomása után.
 */
export class IterationInstructionsModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('isShowingIterationInstructions', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="iteration-instructions-modal" class="dkv-shadow-modal-overlay" data-action="close-iteration-instructions">
        <div class="dkv-shadow-modal-card dkv-shadow-modal-card--cyan dkv-shadow-fade-in-up" style="max-width: 600px;">
          <div class="dkv-shadow-modal-header">
            <h2 class="dkv-shadow-neon-text">Következő lépés: Iteráció</h2>
            <button class="dkv-shadow-close-btn" data-action="close-iteration-instructions">×</button>
          </div>
          
          <div class="dkv-shadow-modal-body">
            <div class="dkv-shadow-modal-info">
               <p>A diára vonatkozó iterációs teendő (megjegyzés) sikeresen rögzítésre került.</p>
               <p>Kérlek, másold ki az alábbi instrukciót, és illeszd be az AI-val (velem) folytatott beszélgetésbe, hogy elvégezzem a kért módosítást:</p>
            </div>

            <div class="dkv-shadow-modal-section">
              <label class="dkv-shadow-label">MÁSOLHATÓ INSTRUKCIÓ (AI Iteráció)</label>
              <div id="iteration-prompt-to-copy" class="dkv-shadow-code-block"></div>
            </div>

            <div class="dkv-shadow-modal-info dkv-shadow-modal-info--italic" style="margin-top: 20px;">
              Illeszd be a kimásolt szöveget, és én újragenerálom / módosítom ezt a konkrét diát.
            </div>
          </div>

          <div class="dkv-shadow-modal-footer" style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="copy-iteration-prompt-btn" class="dkv-shadow-btn dkv-shadow-btn--secondary" data-action="copy-iteration-prompt" style="min-width: 140px;">PROMPT MÁSOLÁSA</button>
            <button class="dkv-shadow-btn dkv-shadow-btn--primary" data-action="close-iteration-instructions">ÉRTETTEM</button>
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
        const promptText = store.iterationPrompt || 'Nincs megadva prompt.';
        this.updateElement('#iteration-prompt-to-copy', promptText, 'textContent');
      } else {
        this.element.classList.remove('dkv-shadow-modal-overlay--visible');
      }
    }
  }
}
