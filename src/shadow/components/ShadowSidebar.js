import { BaseComponent } from './BaseComponent.js';
import { SetupShadow } from './SetupShadow.js';
import { ExportActions } from './ExportActions.js';
import { store } from '../services/store.js';
import { NarrativeEngine } from '../services/narrative-engine.js';
import { Logger } from '../services/Logger.js';

/**
 * SHADOW SIDEBAR COMPONENT (V5)
 * Felelős az oldalsáv konténeréért, a Setup-panelért és a MiniMap-navigációért.
 * Megvalósítja a Rule 60-as takarítást és a Story 3.1-es dekompozíciót.
 */
export class ShadowSidebar extends BaseComponent {
  constructor() {
    super();
    this._initSubscriptions();
  }

  _initSubscriptions() {
    store.subscribe('sidebarCollapsed', (val) => this.handleUpdate('sidebarCollapsed', val));
    store.subscribe('narrative', () => this.handleUpdate('narrative'));
    store.subscribe('sidebarContentVisible', (val) => this.handleUpdate('sidebarContentVisible', val));
    store.subscribe('sidebarIconsVisible', (val) => this.handleUpdate('sidebarIconsVisible', val));
  }

  render() {
    const isCollapsed = store.sidebarCollapsed;

    return `
      <aside id="sidebar" class="dkv-shadow-sidebar ${isCollapsed ? 'dkv-shadow-sidebar--collapsed' : ''}">
        <div class="dkv-shadow-header">
           <span class="dkv-shadow-header__text">PROJEKT PARAMÉTEREK</span>
           <button id="sidebar-toggle" data-action="sidebar-toggle" class="dkv-shadow-sidebar__toggle" type="button">
             ${isCollapsed ? '»' : '«'}
           </button>
        </div>
        
        <div class="dkv-shadow-sidebar__body">
          <!-- Setup Panel (Projekt adatok és akciók) -->
          <div id="setup-panel-root"></div>
          
          <!-- Export és egyéb másodlagos akciók -->
          <div id="export-actions-root" style="width: 100%;"></div>
        </div>
        
        <!-- Mini-map navigáció a body-n KÍVÜL -->
        <nav id="shadow-quick-jump-root" class="dkv-shadow-sidebar__nav"></nav>
      </aside>
    `.trim();
  }

  /**
   * Felülírjuk a mount-ot, hogy a gyermekeket is kezelje.
   */
  mount(container, position = 'append') {
    // 1. Alap konténer létrehozása
    const parent = typeof container === 'string' ? document.querySelector(container) : container;
    if (!parent) return;

    this.element = document.createElement('div');
    this.element.className = 'dkv-shadow-sidebar-wrapper';
    this.element.innerHTML = this.render();

    if (position === 'prepend') {
      parent.prepend(this.element);
    } else {
      parent.appendChild(this.element);
    }

    // 2. Gyermek komponensek inicializálása
    this._mountChildren();
    this.setupEventListeners();
    
    // Kezdeti állapotok kikényszerítése, miután a DOM felépült
    this.handleUpdate('narrative');
    this.handleUpdate('projectTitle', store.projectTitle);
    this.handleUpdate('sidebarCollapsed', store.sidebarCollapsed);
  }

  _mountChildren() {
    Logger.debug('ShadowSidebar: Gyermekek csatolása...');

    // Setup Panel
    const setup = new SetupShadow();
    const setupRoot = this.element.querySelector('#setup-panel-root');
    if (setupRoot) setup.mount(setupRoot);
    this.children.push(setup);

    // Export akciók (Blueprint, Export gombok)
    const exportActions = new ExportActions();
    const exportRoot = this.element.querySelector('#export-actions-root');
    if (exportRoot) {
      exportActions.mount(exportRoot);
    }
    this.children.push(exportActions);
  }

  handleUpdate(property, value) {
    if (!this.element) return;

    // Collapse toggle (Targeted - Rule 60)
    if (property === 'sidebarCollapsed') {
      const isCollapsed = store.sidebarCollapsed;
      this.element.classList.toggle('dkv-shadow-sidebar--collapsed', isCollapsed);
      const innerAside = this.element.querySelector('.dkv-shadow-sidebar');
      if (innerAside) innerAside.classList.toggle('dkv-shadow-sidebar--collapsed', isCollapsed);
      const toggle = this.element.querySelector('#sidebar-toggle');
      if (toggle) toggle.textContent = isCollapsed ? '»' : '«';
    }

    // Title update (Targeted - Rule 60)
    if (property === 'projectTitle') {
      const titleEl = this.element.querySelector('.dkv-shadow-header__text');
      if (titleEl) titleEl.textContent = value || 'ÚJ TÖRTÉNET';
    }

    if (property === 'narrative') {
      const n = store.narrative || [];
      const sections = NarrativeEngine.getSections(n);
      const qjRoot = this.element.querySelector('#shadow-quick-jump-root');
      if (qjRoot) {
        if (n.length === 0) {
          qjRoot.innerHTML = '';
        } else {
          qjRoot.innerHTML = '';
          qjRoot.appendChild(NarrativeEngine.generateMiniMapFragment(sections));
        }
      }
    }

    if (property === 'status') {
      const isLocked = store.isGenerating || store.isWaitingForNarrative;
      this.element.querySelectorAll('button:not(#sidebar-toggle), input, textarea').forEach(el => {
        el.disabled = isLocked;
        if (el.classList.contains('dkv-shadow-btn')) {
          el.classList.toggle('dkv-shadow-btn--disabled', isLocked);
        }
      });
    }

    if (property === 'sidebarContentVisible' || property === 'sidebarIconsVisible') {
      this.element.classList.toggle('dkv-shadow-sidebar--content-hidden', !store.sidebarContentVisible);
      this.element.classList.toggle('dkv-shadow-sidebar--icons-hidden', !store.sidebarIconsVisible);
    }
  }

  setupEventListeners() {
    // Eseménydelegálás a navigációs linkekhez
    const qjRoot = this.element.querySelector('#shadow-quick-jump-root');
    if (qjRoot) {
      qjRoot.onclick = (e) => {
        const link = e.target.closest('.dkv-shadow-jump-link');
        if (link) {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          import('../services/EventBus.js').then(m => {
            m.eventBus.emit(m.EVENTS.NAVIGATE_TO, targetId);
          });
        }
      };
    }
  }
}
