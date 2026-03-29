import { BaseComponent } from '../BaseComponent.js';
import { store } from '../../services/store.js';

/**
 * SHADOW AI INSTRUCTIONS MODAL (Zéró innerHTML)
 * AI instrukciók és prompt másolása.
 */
export class AiInstructionsModalShadow extends BaseComponent {
  constructor() {
    super();
    store.subscribe('isShowingAiInstructions', (val) => this.handleUpdate('visible', val));
  }

  render() {
    return `
      <div id="ai-instructions-modal" class="dkv-modal-overlay dkv-shadow-hidden" data-action="close-ai-instructions">
        <div class="dkv-modal-card dkv-modal-card--cyan dkv-fade-in-up" style="max-width: 600px;">
          <div class="dkv-modal-header">
            <h2 class="dkv-neon-text">Következő lépés: AI Generálás</h2>
            <button class="dkv-close-btn" data-action="close-ai-instructions">×</button>
          </div>
          
          <div class="dkv-modal-body">
            <div class="dkv-modal-info">
               <p>A 30 diás <strong>V4 Blueprint</strong> sikeresen rögzítésre került.</p>
               <p>Kérlek, másold ki az alábbi instrukciót, és illeszd be az AI-val (velem) folytatott beszélgetésbe:</p>
            </div>

            <div class="dkv-modal-section">
              <label class="dkv-label">MÁSOLHATÓ INSTRUKCIÓ (V4 Blueprint alap)</label>
              <div id="prompt-to-copy" class="dkv-code-block" style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 4px; font-family: monospace; font-size: 0.95rem; border: 1px solid var(--neon-cyan); white-space: pre-wrap;"></div>
            </div>

            <div class="dkv-modal-info dkv-modal-info--italic" style="margin-top: 20px;">
              A másolás gomb után csak illeszd be nekem a szöveget, és én legenerálom a teljes történetet.
            </div>
          </div>

          <div class="dkv-modal-footer" style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="copy-prompt-btn" class="dkv-btn dkv-btn--secondary" style="min-width: 140px;">PROMPT MÁSOLÁSA</button>
            <button class="dkv-btn dkv-btn--primary" data-action="close-ai-instructions">ÉRTETTEM</button>
          </div>
        </div>
      </div>
    `.trim();
  }

  handleUpdate(property, value) {
    if (property === 'visible') {
      this.element.classList.toggle('dkv-shadow-hidden', !value);
      if (value) {
        const prompt = store.prompt || 'Nincs megadva prompt.';
        const fullPromptText = `Generálj egy 30 diás V4-es narratívát a következőhöz: "${store.projectTitle}".\nPrompt: ${prompt}`;
        this.updateElement('#prompt-to-copy', fullPromptText, 'textContent');
      }
    }
  }
}
