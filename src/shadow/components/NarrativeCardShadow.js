import { BaseComponent } from './BaseComponent.js';

/**
 * SHADOW NARRATIVE CARD
 * Egy dia kártyájának elszigetelt, osztály-alapú komponense.
 * 100% SZÓ SZERINTI MÁSOLÁS: src/components/NarrativeCard.js alapján.
 */
export class NarrativeCardShadow extends BaseComponent {
  /**
   * @param {Object} slide - A dia adatai.
   * @param {boolean} isHero - Hero kártya-e.
   * @param {number} index - A dia sorszáma a narratívában.
   */
  constructor(slide, isHero = false, index = 0) {
    super();
    this.slide = slide;
    this.isHero = isHero;
    this.index = index;
  }

  render() {
    const slide = this.slide;
    const index = this.index;
    const numberTag = `<span class="dkv-shadow-card-number">#${index + 1}</span>`;

    if (this.isHero) {
      return `
        <div class="dkv-shadow-hero-card" data-id="${slide.id}">
          ${numberTag}
          <button class="dkv-shadow-edit-icon-btn" data-id="${slide.id}">✎</button>
          <div class="dkv-shadow-hero-content">
            <h2 class="dkv-shadow-hero-card__title">${slide.title}</h2>
            <p class="dkv-shadow-hero-card__description">${slide.content}</p>
          </div>
        </div>
      `.trim();
    }

    return `
      <div class="dkv-shadow-small-card" data-id="${slide.id}">
        ${numberTag}
        <button class="dkv-shadow-edit-icon-btn" data-id="${slide.id}">✎</button>
        <div class="dkv-shadow-small-content">
          <h3 class="dkv-shadow-small-card__title">${slide.title}</h3>
          <p class="dkv-shadow-small-card__description">${slide.content}</p>
        </div>
      </div>
    `.trim();
  }

  update(property, value) {
    if (!this.element || property !== 'slide') return;
    const newSlideData = value;
    this.slide = newSlideData;

    // Targeted Update (Rule 60): Csak a címet és a tartalmat frissítjük.
    const titleEl = this.element.querySelector('.dkv-shadow-hero-card__title, .dkv-shadow-small-card__title');
    const descEl = this.element.querySelector('.dkv-shadow-hero-card__description, .dkv-shadow-small-card__description');

    if (titleEl && (titleEl.textContent !== newSlideData.title)) {
      titleEl.textContent = newSlideData.title;
    }
    if (descEl && (descEl.textContent !== newSlideData.content)) {
      descEl.textContent = newSlideData.content;
    }
  }
}
