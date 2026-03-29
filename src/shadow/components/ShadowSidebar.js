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
        <!-- Setup Panel (Projekt adatok és akciók) -->
        <div id="setup-panel-root"></div>
        
        <!-- Navigációs térkép (MiniMap) -->
        <nav id="quick-jump-root" class="dkv-shadow-sidebar__nav"></nav>
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

    this.element = document.createElement('aside');
    this.element.id = 'sidebar';
    this.element.className = `dkv-shadow-sidebar ${store.sidebarCollapsed ? 'dkv-shadow-sidebar--collapsed' : ''}`;
    this.element.innerHTML = `
      <div id="setup-panel-root"></div>
      <nav id="quick-jump-root" class="dkv-shadow-sidebar__nav"></nav>
    `;
    
    if (position === 'prepend') {
      parent.prepend(this.element);
    } else {
      parent.appendChild(this.element);
    }

    // 2. Gyermek komponensek inicializálása
    this._mountChildren();
    this.setupEventListeners();
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
    exportActions.mount(this.element);
    this.children.push(exportActions);

    // Kezdeti MiniMap frissítés
    this._refreshMiniMap();
  }

  _refreshMiniMap() {
    const qjRoot = this.element.querySelector('#quick-jump-root');
    if (qjRoot) {
      if (store.narrative.length > 0) {
        const sections = NarrativeEngine.getSections(store.narrative);
        const fragment = NarrativeEngine.generateMiniMapFragment(sections);
        qjRoot.replaceChildren(fragment);
      } else {
        qjRoot.replaceChildren();
      }
    }
  }

  handleUpdate(property, value) {
    if (!this.element) return;

    if (property === 'sidebarCollapsed') {
      this.element.classList.toggle('dkv-shadow-sidebar--collapsed', value);
    }
    
    if (property === 'narrative') {
      this._refreshMiniMap();
    }

    if (property === 'sidebarContentVisible' || property === 'sidebarIconsVisible') {
        this.element.classList.toggle('dkv-sidebar--content-hidden', !store.sidebarContentVisible);
        this.element.classList.toggle('dkv-sidebar--icons-hidden', !store.sidebarIconsVisible);
    }
  }
}
