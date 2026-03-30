import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW AI INSTRUCTIONS MODAL (Zéró innerHTML)
 * AI instrukciók és prompt másolása.
 * 5. fázis: Teljes CSS-izoláció (dkv-shadow- prefix).
 */
export class AiInstructionsModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('isShowingAiInstructions', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="ai-instructions-modal" class="dkv-shadow-modal-overlay" data-action="close-ai-instructions">
        <div class="dkv-shadow-modal-card dkv-shadow-modal-card--cyan dkv-shadow-fade-in-up" style="max-width: 600px;">
          <div class="dkv-shadow-modal-header">
            <h2 class="dkv-shadow-neon-text">Következő lépés: AI-generálás</h2>
            <button class="dkv-shadow-close-btn" data-action="close-ai-instructions">×</button>
          </div>
          
          <div class="dkv-shadow-modal-body">
            <div class="dkv-shadow-modal-info">
               <p>A 30 diás <strong>V4 Blueprint</strong> sikeresen rögzítésre került.</p>
               <p>Kérlek, másold ki az alábbi instrukciót, és illeszd be az AI-val (velem) folytatott beszélgetésbe:</p>
            </div>

            <div class="dkv-shadow-modal-section">
              <label class="dkv-shadow-label">MÁSOLHATÓ INSTRUKCIÓ (V4 Blueprint alap)</label>
              <div id="prompt-to-copy" class="dkv-shadow-code-block"></div>
            </div>

            <div class="dkv-shadow-modal-info dkv-shadow-modal-info--italic" style="margin-top: 20px;">
              A másolás gomb után csak illeszd be nekem a szöveget, és én legenerálom a teljes történetet.
            </div>
          </div>

          <div class="dkv-shadow-modal-footer" style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="copy-prompt-btn" class="dkv-shadow-btn dkv-shadow-btn--secondary" data-action="copy-prompt" style="min-width: 140px;">PROMPT MÁSOLÁSA</button>
            <button class="dkv-shadow-btn dkv-shadow-btn--primary" data-action="close-ai-instructions">ÉRTETTEM</button>
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
        const prompt = store.prompt || 'Nincs megadva prompt.';
        const fullPromptText = `Generálj egy 30 diás V4-es narratívát a következőhöz: "${store.projectTitle}".\nPrompt: ${prompt}`;
        this.updateElement('#prompt-to-copy', fullPromptText, 'textContent');
      } else {
        this.element.classList.remove('dkv-shadow-modal-overlay--visible');
      }
    }
  }
}
