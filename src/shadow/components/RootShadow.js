import { BaseComponent } from './BaseComponent.js';
// import { ShadowHeader } from './ShadowHeader.js'; // Megtartva biztonsági mentésnek a fájlt, de a hivatkozás kikommentelve
import { ShadowSidebar } from './ShadowSidebar.js';
import { PreviewShadow } from './PreviewShadow.js';
import { store } from '../services/store.js';
import { eventBus, EVENTS } from '../services/EventBus.js';
import { bridgeService } from '../services/ShadowBridgeService.js';
import { NarrativeEngine } from '../services/narrative-engine.js';
import { SlideDetailModalShadow } from './modals/SlideDetailModalShadow.js';
import { IterationModalShadow } from './modals/IterationModalShadow.js';
import { BlueprintModalShadow } from './modals/BlueprintModalShadow.js';
import { AiInstructionsModalShadow } from './modals/AiInstructionsModalShadow.js';
import { IterationInstructionsModalShadow } from './modals/IterationInstructionsModalShadow.js';
import { Logger } from '../services/Logger.js';
import { parseNarrativeContent } from '../services/parsers.js';

/**
 * SHADOW ROOT CONTAINER (V5 - DECOMPOSED)
 * Ez a komponens már csak a fő layout-ért és a modális ablakok koordinációjáért felel.
 * Zéró innerHTML stratégia (Rule 60/61).
 */
export class RootShadow extends BaseComponent {
  constructor() {
    super();
    this._initSubscriptions();
    this._toastTimer = null;
  }

  _initSubscriptions() {
    this._unsub_store = [];
    this._unsub_store.push(store.subscribe('sidebarCollapsed', (val) => this.handleUpdate('sidebarCollapsed', val)));
    this._unsub_store.push(store.subscribe('theme', () => this.handleUpdate('theme')));
    this._unsub_store.push(store.subscribe('projectTitle', () => this.handleUpdate('projectTitle')));
    this._unsub_store.push(store.subscribe('viewingSlideId', (val) => this.handleUpdate('viewingSlideId', val)));
    this._unsub_store.push(store.subscribe('editingSlideId', (val) => this.handleUpdate('editingSlideId', val)));
    this._unsub_store.push(store.subscribe('isEditingBlueprint', (val) => this.handleUpdate('isEditingBlueprint', val)));
    this._unsub_store.push(store.subscribe('isShowingAiInstructions', (val) => this.handleUpdate('isShowingAiInstructions', val)));
    this._unsub_store.push(store.subscribe('isBridgeOnline', () => this.handleUpdate('isBridgeOnline')));

    // AC 2: Eseményvezérelt kommunikáció az exportáláshoz és szinkronhoz
    this._unsub_bus = [];
    this._unsub_bus.push(eventBus.on(EVENTS.EXPORT_MD, () => this._handleExport('markdown')));
    this._unsub_bus.push(eventBus.on(EVENTS.EXPORT_TXT, () => this._handleExport('text')));
    this._unsub_bus.push(eventBus.on(EVENTS.EDIT_BLUEPRINT, () => { store.isEditingBlueprint = true; }));
    this._unsub_bus.push(eventBus.on(EVENTS.SYNC_PROJECT, () => this._handleSyncProject()));
    
    // Globális navigáció kezelése (Smooth Scroll)
    this._unsub_bus.push(eventBus.on(EVENTS.NAVIGATE_TO, (targetId) => this._handleNavigateTo(targetId)));
    this._unsub_bus.push(eventBus.on(EVENTS.SCROLL_TOP, () => this._handleScrollTop()));
  }

  destroy() {
    if (this._unsub_store) this._unsub_store.forEach(fn => fn());
    if (this._unsub_bus) this._unsub_bus.forEach(fn => fn());
    super.destroy();
  }

  render() {
    const isCollapsed = store.sidebarCollapsed;
    return `
      <div class="dkv-shadow-universe">
        <div class="dkv-shadow-layout ${isCollapsed ? 'dkv-shadow-layout--collapsed' : ''} ${store.isGenerating ? 'dkv-shadow-layout--locked' : ''}">
          
          <!-- Az oldalsávot és fejlécet közvetlenül ide mountoljuk -->
          <main class="dkv-shadow-preview-wrapper">
            <div class="dkv-shadow-lock-overlay"></div>
            
            <!-- Előnézet konténer (Grid + Overlay) -->
            <div id="preview-root"></div>
          </main>
        </div>
        
        <!-- Modális ablakok gyűjtőhelye (Zéró innerHTML - rögzített DOM) -->
        <div id="modal-container"></div>
        <div id="global-status-root" class="dkv-shadow-global-status-container"></div>
      </div>
    `.trim();
  }

  /**
   * RootShadow mount - Speciális eset, mert ez a "belépési pont" (appRoot-ba kerül).
   */
  mount(container) {
    const parent = typeof container === 'string' ? document.querySelector(container) : container;
    if (!parent) return;

    this.element = document.createElement('div');
    this.element.className = 'dkv-shadow-root';
    // Kezdeti felépítés (Rule 60: Csak mount-nál engedélyezett az innerHTML string-konverzió)
    const template = document.createElement('template');
    template.innerHTML = this.render();
    this.element.appendChild(template.content);
    parent.appendChild(this.element);

    document.body.classList.add('dkv-shadow-active');
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 1. Gyermek komponensek inicializálása (Közvetlenül a Gridbe)
    const layout = this.element.querySelector('.dkv-shadow-layout');
    const previewWrapper = this.element.querySelector('.dkv-shadow-preview-wrapper');

    // Sidebar: első elem a Gridben (320px)
    const sidebar = new ShadowSidebar();
    if (layout) sidebar.mount(layout, 'prepend'); // Legfelülre/Legelőre szúrjuk be
    this.children.push(sidebar);

    // Header: Kivéve a user kérésére, megtartva csak a hivatkozás szintjén
    // const header = new ShadowHeader();
    // const globalStatusRoot = this.element.querySelector('#global-status-root');
    // if (globalStatusRoot) header.mount(globalStatusRoot);
    
    // Globális státusz (2 ikon: téma + bridge) inicializálása
    this._updateGlobalStatus();

    const preview = new PreviewShadow();
    const previewRoot = this.element.querySelector('#preview-root');
    if (previewRoot) preview.mount(previewRoot);
    this.children.push(preview);

    // 2. Modális ablakok (Rule 60: Előre példányosítjuk őket)
    const modalRoot = this.element.querySelector('#modal-container');
    if (modalRoot) {
      this.modals = {
        blueprint: new BlueprintModalShadow(),
        aiInstructions: new AiInstructionsModalShadow(),
        iterationInstructions: new IterationInstructionsModalShadow(),
        slideDetail: new SlideDetailModalShadow(),
        iteration: new IterationModalShadow()
      };
      Object.values(this.modals).forEach(m => {
        m.mount(modalRoot);
        this.children.push(m);
      });
    }

    // 3. KÖZPONTI ESEMÉNY FIGYELŐ (Delegált eseménykezelés)
    this._rootClickHandler = async (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        e.stopImmediatePropagation();
        const action = actionBtn.getAttribute('data-action');

        switch (action) {
          case 'sidebar-toggle': {
            const isCollapsed = store.sidebarCollapsed;
            if (!isCollapsed) {
              // ZÁRÁS (Fő rendszer paritás)
              store.sidebarContentVisible = false;
              setTimeout(() => {
                store.sidebarCollapsed = true;
              }, 300);
              setTimeout(() => {
                store.sidebarIconsVisible = true;
              }, 700);
            } else {
              // NYITÁS (Fő rendszer paritás)
              store.sidebarIconsVisible = false;
              setTimeout(() => {
                store.sidebarCollapsed = false;
              }, 300);
              setTimeout(() => {
                store.sidebarContentVisible = true;
                // Az ikonok direkt rejtve maradnak nyitott állapotban, ahogy a fő rendszerben!
              }, 700);
            }
            break;
          }
          case 'scroll-top':
            this.element.querySelector('.dkv-shadow-preview-wrapper')?.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case 'generate':
            this._handleGenerate();
            break;
          case 'load-story':
            this._handleLoadStory();
            break;
          case 'refresh-bridge':
            this._handleRefreshBridge();
            break;
          case 'save-iteration':
            this._handleSaveIteration();
            break;
          case 'save-blueprint':
            this._handleSaveBlueprint();
            break;
          case 'copy-prompt':
            this._handleCopyPrompt();
            break;
          case 'copy-iteration-prompt':
            this._handleCopyIterationPrompt();
            break;
          case 'edit-blueprint':
            store.isEditingBlueprint = true;
            break;
          case 'export-md':
            this._handleExport('markdown');
            break;
          case 'export-txt':
            this._handleExport('text');
            break;
          case 'sync-project':
            this._handleSyncProject();
            break;
          default:
            if (action.startsWith('close-')) {
              this._handleModalClose(action, e.target);
            } else {
              Logger.debug(`RootShadow: Ismeretlen action: "${action}"`);
            }
        }
        return;
      }

      // 0. KÁRTYA MEGTEKINTÉSE VAGY SZERKESZTÉSE
      const card = e.target.closest('.dkv-shadow-hero-card, .dkv-shadow-small-card');
      if (card) {
        const editBtn = e.target.closest('.dkv-shadow-edit-icon-btn');
        if (editBtn) {
          // SZERKESZTÉS MÓD
          store.editingSlideId = editBtn.getAttribute('data-id');
        } else if (!e.target.closest('button')) {
          // OLVASÓ MÓD
          const id = card.getAttribute('data-id');
          if (id) store.viewingSlideId = id;
        }
      }
    };

    this.element.addEventListener('click', this._rootClickHandler, { capture: true });

    // 4. BRIDGE KÖRNYEZET-DETEKTÁLÁS (automatikus indítás)
    bridgeService.detectEnvironment().then(() => {
      this._updateGlobalStatus();
      Logger.info(`Shadow: Bridge állapot: ${store.isBridgeOnline ? 'ONLINE' : 'OFFLINE'}`);
    });
  }

  /**
   * Modális bezárása fade-out animációval (fő rendszer paritás: 600ms delay).
   * Kezeli: overlay kattintás, × gomb, és „ÉRTETTEM" típusú gombok.
   */
  _handleModalClose(action, target) {
    const isCloseIcon = target.classList.contains('dkv-shadow-close-btn');
    const isOverlay = target.classList.contains('dkv-shadow-modal-overlay');
    const isActionBtn = target.classList.contains('dkv-shadow-btn--primary');

    if (isCloseIcon || isOverlay || isActionBtn) {
      const overlay = isOverlay ? target : target.closest('.dkv-shadow-modal-overlay');
      if (overlay) {
        overlay.classList.add('dkv-shadow-modal-overlay--closing');
        setTimeout(() => {
          overlay.classList.remove('dkv-shadow-modal-overlay--closing');
          overlay.classList.remove('dkv-shadow-modal-overlay--visible');
          if (action === 'close-blueprint') store.isEditingBlueprint = false;
          if (action === 'close-ai-instructions') {
            store.isShowingAiInstructions = false;
            // Szándékosan nem állítjuk false-ra a isGenerating és isWaiting állapotokat,
            // hogy a felület blokkolva maradjon, amíg a generálás ténylegesen be nem fejeződik (AI válasz).
          }
          if (action === 'close-iteration-instructions') {
            store.isShowingIterationInstructions = false;
          }
          if (action === 'close-view-modal') store.viewingSlideId = null;
          if (action === 'close-iteration') store.editingSlideId = null;
        }, 600);
      }
    }
  }

  async _handleGenerate() {
    if (store.isGenerating) return;
    store.isGenerating = true;
    try {
      // JAVÍTÁS: narrativeConfig átadása is kötelező, különben a SchemaValidator betöltéskor Critical Errort dob!
      await bridgeService.saveBlueprint({ 
        title: store.projectTitle, 
        prompt: store.prompt,
        narrativeConfig: store.narrativeConfig
      });
      const newNarrative = await NarrativeEngine.generate(store.projectTitle, store.prompt);
      store.narrative = [...newNarrative];
      await bridgeService.syncFullProject(store.projectTitle, newNarrative);
      store.isGenerating = false;
      store.isWaitingForNarrative = true;
      store.isShowingAiInstructions = true;
    } catch (err) {
      Logger.error('Shadow: Generálás hiba', err);
      store.isGenerating = false;
    }
  }

  _handleLoadStory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = parseNarrativeContent(event.target.result, file.name.endsWith('.md') ? 'markdown' : 'text');
        if (result && result.narrative.length > 0) {
          Logger.info(`LoadStory: Régi narrative.length=${store.narrative.length}, Új narrative.length=${result.narrative.length}`);
          Logger.info(`LoadStory: Régi ref === Új ref: ${store.narrative === result.narrative}`);
          store.narrative = result.narrative;
          Logger.info(`LoadStory: store.narrative.length UTÁN = ${store.narrative.length}`);
          store.projectTitle = result.title || 'Betöltött Projekt';
          Logger.info(`LoadStory: projectTitle beállítva: "${store.projectTitle}"`);
          
          // INPUTOK ÜRÍTÉSE a felhasználó kérésének megfelelően
          const titleInput = document.querySelector('#input-title');
          const promptInput = document.querySelector('#prompt-input');
          if (titleInput) titleInput.value = '';
          if (promptInput) promptInput.value = '';

          // Automatikus Hátterszinkronizáció (Deep Sync) az AI Bridge fájlrendszerével
          if (store.mode === 'bridge') {
            bridgeService.syncFullProject(store.projectTitle, result.narrative).then(() => {
              Logger.info('Shadow: Betöltött történet sikeresen szinkronizálva a háttérrel!');
            }).catch(err => {
              Logger.error('Shadow: Szinkronizációs hiba a történet betöltésekor:', err);
            });
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  _handleExport(format) {
    if (!store.narrative || store.narrative.length === 0) return;
    
    const title = store.projectTitle || 'Névtelen-Projekt';
    const date = new Date().toISOString().split('T')[0];
    const filename = `dk-story-${title.replace(/\s+/g, '-')}-${date}.${format === 'markdown' ? 'md' : 'txt'}`;
    
    let content = '';
    if (format === 'markdown') {
      content = `# ${title}\n\n`;
      content += `*Generálva: ${new Date().toLocaleString('hu-HU')}*\n\n---\n\n`;
      store.narrative.forEach((slide, index) => {
        content += `## Dia ${index + 1}: ${slide.title}\n\n${slide.content}\n\n---\n\n`;
      });
    } else {
      content = `${title}\n`;
      content += `Generálva: ${new Date().toLocaleString('hu-HU')}\n\n`;
      store.narrative.forEach((slide, index) => {
        content += `DIA ${index + 1}: ${slide.title}\n`;
        content += `${slide.content}\n\n`;
        content += `--------------------------------------------------\n\n`;
      });
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async _handleSyncProject() {
    if (!store.isBridgeOnline) {
      store.toastMessage = 'HIBA: A Bridge nem elérhető a szinkronizációhoz!';
      return;
    }
    store.isGenerating = true;
    try {
      await bridgeService.syncFullProject(store.projectTitle, store.narrative);
      store.needsSync = false;
      store.toastMessage = 'Sikeres szinkronizáció!';
      Logger.info('Shadow: Projekt sikeresen szinkronizálva.');
    } catch (err) {
      Logger.error('Shadow: Szinkron hiba', err);
      store.toastMessage = 'HIBA a szinkronizálás során: ' + err.message;
    } finally { store.isGenerating = false; }
  }

  handleUpdate(property, value) {
    if (!this.element) return;

    if (property === 'sidebarCollapsed') {
      const wrapper = this.element.querySelector('.dkv-shadow-layout');
      if (wrapper) wrapper.classList.toggle('dkv-shadow-layout--collapsed', store.sidebarCollapsed);
    }

    if (property === 'theme' || property === 'isBridgeOnline' || !property) {
      this._updateGlobalStatus();
    }

    // Toast kezelése (Teljes függetlenség – B opció)
    if (property === 'toastMessage' && value) {
      this._showToast(value);
    }
  }

  /**
   * Saját shadow toast értesítés megjelenítése.
   * @param {string} message - A megjelenítendő üzenet.
   */
  _showToast(message) {
    // Korábbi toast törlése
    const existing = this.element.querySelector('.dkv-shadow-toast');
    if (existing) existing.remove();
    if (this._toastTimer) clearTimeout(this._toastTimer);

    const toast = document.createElement('div');
    toast.className = 'dkv-shadow-toast';
    toast.textContent = message;
    this.element.appendChild(toast);

    this._toastTimer = setTimeout(() => {
      toast.classList.add('dkv-shadow-toast--hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        if (store.toastMessage === message) store.toastMessage = '';
      }, 500);
    }, 3000);
  }

  /**
   * Sima görgetés a megadott elemhez a shadow preview területen belül.
   */
  _handleNavigateTo(targetId) {
    if (!targetId || typeof targetId !== 'string') return;
    // Megkeressük a cél elemet a saját fánkon belül
    const target = this.element.querySelector(targetId);
    const wrapper = this.element.querySelector('.dkv-shadow-preview-wrapper');
    
    if (target && wrapper) {
      Logger.debug(`Shadow: Navigálás a szekcióhoz: ${targetId}`);
      // Animált görgetés a wrapperen belül
      const offsetTop = target.offsetTop;
      wrapper.scrollTo({
        top: offsetTop - 20, // 20px biztonsági margó
        behavior: 'smooth'
      });
    }
  }

  /**
   * Görgessen az előnézeti terület tetejére.
   */
  _handleScrollTop() {
    const wrapper = this.element.querySelector('.dkv-shadow-preview-wrapper');
    if (wrapper) {
      wrapper.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Kirajzolja a két globális státusz ikont (Téma + Bridge)
   */
  _updateGlobalStatus() {
    const root = this.element.querySelector('#global-status-root');
    if (!root) return;

    const isOnline = store.isBridgeOnline;
    const themeIcon = store.theme === 'cyber-fantasy' ? 'light_mode' : 'dark_mode';
    const statusClass = isOnline === null ? 'dkv-shadow-bridge-status--unknown' : 
                       (isOnline ? 'dkv-shadow-bridge-status--online' : 'dkv-shadow-bridge-status--offline');
    
    const tooltipText = isOnline === null ? 'Bridge állapota ismeretlen...' :
                       (isOnline ? 'Bridge online – Készen állunk a mentésre.' : 'Bridge offline – Indítsd el az "npm run bridge" parancsot!');

    root.innerHTML = `
      <div id="shadow-theme-toggle" class="dkv-shadow-theme-toggle" title="Téma váltása">
        <span class="material-symbols-outlined">${themeIcon}</span>
      </div>
      <div class="dkv-shadow-global-bridge-status">
        <div class="dkv-shadow-bridge-status ${statusClass}" title="Bridge Frissítése" data-action="refresh-bridge">
          <span class="dkv-shadow-bridge-icon">${isOnline ? '✓' : (isOnline === null ? '?' : '!')}</span>
          <span class="dkv-shadow-bridge-status__tooltip">${tooltipText}</span>
        </div>
      </div>
    `;

    // Eseménykezelő a témaváltóhoz
    const themeBtn = root.querySelector('#shadow-theme-toggle');
    if (themeBtn) {
      themeBtn.onclick = (e) => {
        e.stopPropagation();
        import('../services/ThemeManager.js').then(m => m.themeManager.toggleTheme());
      };
    }
  }

  /**
   * Bridge állapot manuális frissítése.
   */
  async _handleRefreshBridge() {
    store.toastMessage = 'Bridge állapotának ellenőrzése...';
    try {
      const isOnline = await bridgeService.checkHealth();
      store.isBridgeOnline = isOnline;
      this._updateGlobalStatus();
    } catch (err) {
      store.isBridgeOnline = false;
      this._updateGlobalStatus();
    }
  }

  /**
   * Iterációs megjegyzés mentése a Bridge-nek.
   */
  async _handleSaveIteration() {
    const textarea = this.element.querySelector('#iteration-note');
    const note = textarea ? textarea.value.trim() : '';
    const slideId = store.editingSlideId;
    if (!slideId) return;

    if (!note) {
      store.toastMessage = 'Nem adtál meg módosítási kérést!';
      return;
    }

    const index = store.narrative.findIndex(s => s.id === slideId);
    let slideTitle = slideId;
    let slideContent = '';
    if (index !== -1) {
      store.narrative[index].notes = note;
      store.narrative = [...store.narrative];
      slideTitle = store.narrative[index].title;
      slideContent = store.narrative[index].content;
    }

    try {
      await bridgeService.saveIteration(slideId, note);
      store.toastMessage = 'Megjegyzés mentve!';
      Logger.info('Shadow: Iterációs megjegyzés mentve.');
      
      // Prompt generálás és modális ablak megnyitása BŐVÍTVE a jelenlegi szöveggel (A opció)
      store.iterationPrompt = `Kérek egy iterációt a "${slideTitle}" (ID: ${slideId}) című dián. 

A dia jelenlegi szövege:
"${slideContent}"

A módosítási kérésem a következő:
${note}`;
      store.isShowingIterationInstructions = true;
    } catch (err) {
      Logger.error('Shadow: Hiba az iteráció mentésekor:', err);
      store.toastMessage = 'Hiba a háttérmentéskor.';
    }
    store.editingSlideId = null; // Bezárja a szerkesztő modálist
  }

  /**
   * Mesterleíró (Blueprint) mentése a Bridge-nek.
   */
  async _handleSaveBlueprint() {
    const textarea = this.element.querySelector('#blueprint-textarea');
    if (!textarea) return;

    const blueprintContent = textarea.value;
    const saveBtn = this.element.querySelector('#save-blueprint');
    const originalText = saveBtn ? saveBtn.innerText : '';

    if (saveBtn) {
      saveBtn.innerText = 'MENTÉS ÉS BEÉPÍTÉS...';
      saveBtn.disabled = true;
    }

    try {
      await bridgeService.saveMasterBlueprint(blueprintContent);
      store.blueprint = blueprintContent;
      store.toastMessage = 'Blueprint sikeresen frissítve!';
      Logger.info('Shadow: Blueprint sikeresen mentve.');
      setTimeout(() => {
        store.isEditingBlueprint = false;
      }, 300);
    } catch (err) {
      Logger.error('Shadow: Hiba a Blueprint mentésekor:', err);
      store.toastMessage = 'MENTÉSI HIBA: ' + err.message;
      if (saveBtn) {
        saveBtn.innerText = 'Hiba! Próbáld újra';
        setTimeout(() => {
          if (store.isEditingBlueprint && saveBtn) saveBtn.innerText = originalText;
        }, 2000);
      }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  /**
   * Prompt szöveg másolása a vágólapra.
   */
  async _handleCopyPrompt() {
    const promptEl = this.element.querySelector('#prompt-to-copy');
    if (!promptEl) return;

    try {
      await navigator.clipboard.writeText(promptEl.textContent);
      store.toastMessage = 'Prompt sikeresen kimásolva!';
      const btn = this.element.querySelector('#copy-prompt-btn');
      if (btn) {
        btn.innerText = '✓ KIMÁSOLVA';
        setTimeout(() => { btn.innerText = 'PROMPT MÁSOLÁSA'; }, 2000);
      }
    } catch (err) {
      Logger.error('Shadow: Vágólap hiba:', err);
      store.toastMessage = 'Hiba a másolás során.';
    }
  }

  /**
   * Iterációs prompt másolása a vágólapra
   */
  async _handleCopyIterationPrompt() {
    const promptEl = this.element.querySelector('#iteration-prompt-to-copy');
    if (!promptEl) return;

    try {
      await navigator.clipboard.writeText(promptEl.textContent);
      store.toastMessage = 'Prompt sikeresen kimásolva!';
      const btn = this.element.querySelector('#copy-iteration-prompt-btn');
      if (btn) {
        btn.innerText = '✓ KIMÁSOLVA';
        setTimeout(() => { btn.innerText = 'PROMPT MÁSOLÁSA'; }, 2000);
      }
    } catch (err) {
      Logger.error('Shadow: Vágólap hiba:', err);
      store.toastMessage = 'Hiba a másolás során.';
    }
  }
}
