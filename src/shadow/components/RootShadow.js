import { BaseComponent } from './BaseComponent.js';
import { ShadowHeader } from './ShadowHeader.js';
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
    
    // AC 2: Eseményvezérelt kommunikáció az exportáláshoz és szinkronhoz
    this._unsub_bus = [];
    this._unsub_bus.push(eventBus.on(EVENTS.EXPORT_MD, () => this._handleExport('markdown')));
    this._unsub_bus.push(eventBus.on(EVENTS.EXPORT_TXT, () => this._handleExport('text')));
    this._unsub_bus.push(eventBus.on(EVENTS.EDIT_BLUEPRINT, () => { store.isEditingBlueprint = true; }));
    this._unsub_bus.push(eventBus.on(EVENTS.SYNC_PROJECT, () => this._handleSyncProject()));
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

    // Header: a Preview Wrapper tetejére
    const header = new ShadowHeader();
    if (previewWrapper) header.mount(previewWrapper, 'prepend');
    this.children.push(header);

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
          case 'sidebar-toggle':
            store.sidebarCollapsed = !store.sidebarCollapsed;
            break;
          case 'scroll-top':
            this.element.querySelector('.dkv-shadow-preview-wrapper')?.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case 'generate':
            this._handleGenerate();
            break;
          case 'load-story':
            this._handleLoadStory();
            break;
          default:
            if (action.startsWith('close-')) {
               this._handleModalClose(action, e.target);
            }
        }
        return;
      }

      const card = e.target.closest('.dkv-shadow-card');
      if (card && !e.target.closest('button')) {
        const id = card.getAttribute('data-id');
        if (id) store.viewingSlideId = id;
      }
    };

    this.element.addEventListener('click', this._rootClickHandler, { capture: true });
  }

  _handleModalClose(action, target) {
    const isDoneBtn = target.classList.contains('dkv-btn--primary');
    const isCloseIcon = target.classList.contains('dkv-close-btn');
    const isOverlay = target.classList.contains('dkv-modal-overlay');

    if (isDoneBtn || isCloseIcon || isOverlay) {
      const overlay = target.closest('.dkv-modal-overlay');
      if (overlay) {
        overlay.classList.add('dkv-modal-overlay--closing');
        setTimeout(() => {
          overlay.classList.remove('dkv-modal-overlay--closing');
          if (action === 'close-blueprint') store.isEditingBlueprint = false;
          if (action === 'close-ai-instructions') {
            store.isShowingAiInstructions = false;
            store.isGenerating = false;
            store.isWaitingForNarrative = false;
          }
          if (action === 'close-view-modal') store.viewingSlideId = null;
          if (action === 'close-iteration') store.editingSlideId = null;
        }, 300);
      }
    }
  }

  async _handleGenerate() {
    if (store.isGenerating) return;
    store.isGenerating = true;
    try {
      await bridgeService.saveBlueprint({ title: store.projectTitle, prompt: store.prompt });
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
          store.narrative = result.narrative;
          store.projectTitle = result.title || 'Betöltött Projekt';
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  _handleExport(format) {
    if (!store.narrative.length) return;
    const date = new Date().toISOString().split('T')[0];
    const filename = `dk-story-${date}.${format === 'markdown' ? 'md' : 'txt'}`;
    let content = format === 'markdown' ? `# ${store.projectTitle}\n\n` : `${store.projectTitle}\n\n`;
    store.narrative.forEach((s, i) => {
      content += `DIA ${i + 1}: ${s.title}\n${s.content}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async _handleSyncProject() {
    if (!store.isBridgeOnline) return;
    store.isGenerating = true;
    try {
      await bridgeService.saveShadowNarrative(store.projectTitle, store.narrative);
      store.toastMessage = 'Sikeres Shadow-szinkronizáció!';
    } catch (err) {
      Logger.error('Shadow: Szinkron hiba', err);
    } finally { store.isGenerating = false; }
  }

  handleUpdate(property, value) {
    if (!this.element) return;
    
    if (property === 'sidebarCollapsed') {
      const layout = this.element.querySelector('.dkv-shadow-layout');
      if (layout) layout.classList.toggle('dkv-shadow-layout--collapsed', value);
    }

    // A modálisok és a preview magukat frissítik (Rule 60 reaktív lánc)
  }
}
