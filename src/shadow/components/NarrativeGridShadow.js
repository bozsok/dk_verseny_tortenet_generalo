import { BaseComponent } from './BaseComponent.js';
import { NarrativeCardShadow } from './NarrativeCardShadow.js';
import { store } from '../services/store.js';
import { NarrativeEngine } from '../services/narrative-engine.js';
import { Logger } from '../services/Logger.js';

/**
 * SHADOW NARRATIVE GRID
 * A diák rácsának elszigetelt, osztály-alapú kezelője.
 * 100% VIZUÁLIS HŰSÉG: Szó szerinti másolás az eredeti main.js 391-435. sorai alapján.
 */
export class NarrativeGridShadow extends BaseComponent {
  constructor() {
    super();
    this.cardsMap = new Map();
    this._initSubscriptions();
  }

  _initSubscriptions() {
    store.subscribe('narrative', (val) => this.update('narrative', val));
    store.subscribe('projectTitle', (val) => this.update('projectTitle', val));
  }

  render() {
    const narrative = store.narrative || [];
    const projectTitle = store.projectTitle || 'NÉVTELEN PROJEKT';

    if (narrative.length === 0) {
      return `<h2 class="dkv-shadow-neon-text">${projectTitle}</h2><p style="color:var(--text-dim);">Árnyék-narratíva betöltése...</p>`.trim();
    }

    const sections = NarrativeEngine.getSections(narrative);

    return `
      <div class="dkv-shadow-grid">
        <h2 id="slides-title" class="dkv-shadow-neon-text">
          ${projectTitle || 'NÉVTELEN PROJEKT'}
        </h2>
        ${sections.map((sec, idx) => {
      const items = narrative.slice(sec.start, sec.end);
      if (items.length === 0) return '';
      const sectionColor = sec.color || 'var(--neon-cyan)';
      return `
            <div id="${sec.id}" class="dkv-shadow-section" style="margin-bottom: 80px;">
              <div class="dkv-shadow-zone-card dkv-shadow-card--animated" style="--section-accent: ${sectionColor}; animation-delay: ${sec.start * 0.08}s;">
                <div class="dkv-shadow-zone-icon">${sec.icon}</div>
                <div class="dkv-shadow-zone-info">
                  <span class="dkv-shadow-zone-tag">${sec.title.split(' // ')[0]}</span>
                  <h3 class="dkv-shadow-zone-title">${sec.title.split(' // ')[1]}</h3>
                </div>
              </div>

              <div class="dkv-shadow-cards-grid">
                ${items.map((item, i) => {
        const globalIndex = sec.start + i;
        const itemsCount = items.length;
        const isOdd = itemsCount % 2 !== 0;

        let gridStyle = '';
        if (isOdd) {
          if ((sec.id === 'sec-on' && i === 0) || (sec.id === 'sec-fi' && i === itemsCount - 1)) {
            gridStyle = 'grid-column: span 2;';
          }
        }

        const delay = globalIndex * 0.08;
        return `
                     <div class="dkv-shadow-card--animated" style="${gridStyle} animation-delay: ${delay}s;" id="mount-${item.id}">
                     </div>
                  `;
      }).join('')}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `.trim();
  }

  setupEventListeners() {
    this._mountCards();
    // Race-condition fix (Ha már vannak adatok az induláskor)
    if (store.narrative && store.narrative.length > 0) {
      this.handleUpdate('narrative', store.narrative);
    }
  }

  _mountCards() {
    const narrative = store.narrative || [];
    const sections = NarrativeEngine.getSections(narrative);

    sections.forEach((sec) => {
      const items = narrative.slice(sec.start, sec.end);
      items.forEach((item, i) => {
        const globalIndex = sec.start + i;
        const itemsCount = items.length;
        const isOdd = itemsCount % 2 !== 0;
        const isHero = isOdd && ((sec.id === 'sec-on' && i === 0) || (sec.id === 'sec-fi' && i === itemsCount - 1));

        const card = new NarrativeCardShadow(item, isHero, globalIndex);
        const mountPoint = this.element.querySelector(`#mount-${item.id}`);
        if (mountPoint) {
          card.mount(mountPoint);
          this.cardsMap.set(item.id, card);
          this.children.push(card);
        }
      });
    });
  }

  update(property, value) {
    if (!this.element) return;

    if (property === 'projectTitle') {
      const titleEl = this.element.querySelector('#slides-title');
      if (titleEl) titleEl.textContent = value;
    }

    if (property === 'narrative') {
      // Targeted update check (Rule 60)
      if (this.cardsMap.size === value.length && value.length > 0) {
        value.forEach(slide => {
          const card = this.cardsMap.get(slide.id);
          if (card) card.update('slide', slide);
        });
      } else {
        // Layout change or initial load (Rule 60 compliance: selective replacement)
        this.cardsMap.clear();
        this.children = [];
        
        // Elővesszük a render-t, de törekszünk a DOM-megőrzésre
        const temp = document.createElement('div');
        temp.innerHTML = this.render();
        const nextGrid = temp.firstElementChild;
        
        if (nextGrid) {
          this.element.replaceChildren(...nextGrid.childNodes);
          this.setupEventListeners();
        }
      }
    }
  }
}
