import { store } from '../services/store.js';

export const SetupPanel = () => {
  const isLocked = store.isGenerating;
  const disabledAttr = isLocked ? 'disabled' : '';
  const lockedBtnClass = isLocked ? 'dkv-btn--disabled' : '';

  return `
    <div class="dkv-sidebar__header">
      <span class="dkv-sidebar__header-text">PROJEKT PARAMÉTEREK</span>
      
      <button id="sidebar-toggle" class="dkv-sidebar__toggle" ${disabledAttr}>
        ${store.sidebarCollapsed ? '»' : '«'}
      </button>
    </div>
    
    <div class="dkv-sidebar__body">
      <div class="dkv-input-block">
        <label class="dkv-label">PROJEKT CÍME (TÖRTÉNET NEVE)</label>
        <input id="input-title" type="text" class="dkv-input" placeholder="pl. Kód Királyság: Az Utolsó Kernel" value="${store.projectTitle}" ${disabledAttr}>
      </div>

      <div class="dkv-input-block">
        <label class="dkv-label">NARRATÍVA-KONCEPTUS ÉS FINOMHANGOLÁS</label>
        <textarea id="prompt-input" class="dkv-textarea dkv-textarea--medium" placeholder="Írd le a történet alapötletét vagy fűzz hozzá globális kéréseket..." ${disabledAttr}>${store.prompt || store.projectShortDesc}</textarea>
      </div>

      <div class="dkv-sidebar__actions">
        <button id="generate-btn" data-action="generate" class="dkv-btn dkv-btn--primary ${lockedBtnClass}" ${disabledAttr}>
          ${isLocked ? 'GENERÁLÁS FOLYAMATBAN...' : 'AI-GENERÁLÁS INDÍTÁSA'}
        </button>
        
        <button id="load-story-btn" data-action="load-story" class="dkv-btn dkv-btn--secondary ${lockedBtnClass}" ${disabledAttr}>
          TÖRTÉNET BETÖLTÉSE
        </button>

        ${store.needsSync && store.isBridgeOnline ? `
          <button id="sync-project-btn" data-action="sync-project" class="dkv-btn dkv-btn--sync ${lockedBtnClass}" ${disabledAttr}>
            SZINKRONIZÁCIÓ A PROJEKTBE
          </button>
        ` : ''}
      </div>

      <div class="dkv-sidebar__secondary-actions">
        <button id="blueprint-btn" data-action="edit-blueprint" class="dkv-btn dkv-btn--secondary ${lockedBtnClass}" ${disabledAttr}>
          BLUEPRINT
        </button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
          <button id="export-md-btn" data-action="export-md" class="dkv-btn dkv-btn--accent ${lockedBtnClass}" ${disabledAttr} title="Markdown-exportálás">
            .MD
          </button>
          <button id="export-txt-btn" data-action="export-txt" class="dkv-btn dkv-btn--accent ${lockedBtnClass}" ${disabledAttr} title="Sima szöveges exportálás">
            .TXT
          </button>
        </div>
      </div>
    </div>
  `;
};
