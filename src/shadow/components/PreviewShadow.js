import { BaseComponent } from './BaseComponent.js';
import { NarrativeGridShadow } from './NarrativeGridShadow.js';
import { store } from '../services/store.js';

/**
 * PREVIEW SHADOW COMPONENT (V5)
 * Felelős az előnézeti terület (diák táblázata) és a generálási overlay kezeléséért.
 * Megvalósítja a Story 3.2-es dekompozíciót.
 */
export class PreviewShadow extends BaseComponent {
  constructor() {
    super();
    this._initSubscriptions();
  }

  _initSubscriptions() {
    this._unsub = [];
    // Figyeljük a generálási állapotokat és a narratíva változását
    this._unsub.push(store.subscribe('isGenerating', () => this.handleUpdate('status')));
    this._unsub.push(store.subscribe('isWaitingForNarrative', () => this.handleUpdate('status')));
    this._unsub.push(store.subscribe('narrative', () => this.handleUpdate('status')));
  }

  destroy() {
    if (this._unsub) {
      this._unsub.forEach(fn => fn());
    }
    super.destroy();
  }

  render() {
    return `
      <div class="dkv-shadow-preview-wrapper">
        <!-- Diák konténere -->
        <section id="slides-container" class="dkv-shadow-slides-viewer"></section>
        
        <!-- Állapotjelző Overlay (Generálás/Várakozás alatt) -->
        <div id="preview-status-root" class="dkv-shadow-status-container" style="display: none;">
          <div id="status-syncing" class="dkv-shadow-status dkv-shadow-hidden">
             <div class="dkv-shadow-status-card">
                <h2 class="dkv-shadow-neon-text">SZINKRONIZÁCIÓ...</h2>
                <div class="dkv-shadow-digital-pulse"></div>
             </div>
          </div>
          <div id="status-waiting" class="dkv-shadow-status dkv-shadow-hidden">
             <div class="dkv-shadow-status-card">
                <h2 class="dkv-shadow-neon-text">VÁRAKOZÁS AI-RA</h2>
                <p class="dkv-shadow-fade-in">Nyomd meg az AI-generálás gombot a kezdéshez!</p>
             </div>
          </div>
        </div>
      </div>
    `.trim();
  }

  /**
   * Felülírjuk a mount-ot, hogy a belső hálót (grid) is inicializálja.
   */
  mount(container) {
    // 1. Alap konténer létrehozása
    const parent = typeof container === 'string' ? document.querySelector(container) : container;
    if (!parent) return;

    this.element = document.createElement('div');
    this.element.className = 'dkv-shadow-preview-wrapper';
    this.element.innerHTML = this.render();
    parent.appendChild(this.element);

    // 2. Belső komponensek csatolása
    this._mountChildren();
    
    // 3. Kezdeti állapot beállítása
    this._refreshStatusOverlay();
  }

  _mountChildren() {
    const grid = new NarrativeGridShadow();
    const slidesRoot = this.element.querySelector('#slides-container');
    if (slidesRoot) grid.mount(slidesRoot);
    this.children.push(grid);
  }

  /**
   * Kezeli az overlay megjelenítését a generálási folyamat fázisai alapján (Rule 60).
   */
  _refreshStatusOverlay() {
    const statusRoot = this.element.querySelector('#preview-status-root');
    const slidesContainer = this.element.querySelector('#slides-container');
    const syncCard = this.element.querySelector('#status-syncing');
    const waitCard = this.element.querySelector('#status-waiting');

    if (!statusRoot || !slidesContainer || !syncCard || !waitCard) return;

    if (store.isGenerating) {
      statusRoot.style.display = 'flex';
      syncCard.classList.remove('dkv-shadow-hidden');
      waitCard.classList.add('dkv-shadow-hidden');
      slidesContainer.style.display = 'none';
    } else if (store.isWaitingForNarrative && store.narrative.length === 0) {
      statusRoot.style.display = 'flex';
      syncCard.classList.add('dkv-shadow-hidden');
      waitCard.classList.remove('dkv-shadow-hidden');
      slidesContainer.style.display = 'none';
    } else {
      statusRoot.style.display = 'none';
      slidesContainer.style.display = 'block';
    }
  }

  handleUpdate(property) {
    if (property === 'status') {
      this._refreshStatusOverlay();
    }
  }
}
