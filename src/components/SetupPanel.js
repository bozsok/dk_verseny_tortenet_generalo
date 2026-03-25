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
        <label class="dkv-label">NARRATÍVA KONCEPTUS ÉS FINOMHANGOLÁS</label>
        <textarea id="prompt-input" class="dkv-textarea dkv-textarea--medium" placeholder="Írd le a történet alapötletét vagy fűzz hozzá globális kéréseket..." ${disabledAttr}>${store.prompt || store.projectShortDesc}</textarea>
      </div>

      <div class="dkv-sidebar__actions">
        <button id="generate-btn" data-action="generate" class="dkv-btn dkv-btn--primary ${lockedBtnClass}" ${disabledAttr}>
          ${isLocked ? 'GENERÁLÁS FOLYAMATBAN...' : 'AI GENERÁLÁS INDÍTÁSA'}
        </button>
        
        <div class="dkv-sidebar__secondary-actions">
          <button id="blueprint-btn" data-action="edit-blueprint" class="dkv-btn dkv-btn--secondary ${lockedBtnClass}" ${disabledAttr}>
            BLUEPRINT SZERKESZTÉSE
          </button>
          <button id="export-btn" data-action="export" class="dkv-btn dkv-btn--accent ${lockedBtnClass}" ${disabledAttr}>
            EXPORTÁLÁS
          </button>
        </div>
      </div>
    </div>
  `;
};
