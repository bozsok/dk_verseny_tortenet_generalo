export const NarrativeCard = (slide, isHero = false, index = 0) => {
  const numberTag = `<span class="dkv-card-number">#${index + 1}</span>`;

  if (isHero) {
    return `
      <div class="dkv-hero-card">
        ${numberTag}
        <button class="dkv-edit-icon-btn" data-id="${slide.id}">✎</button>
        <div class="dkv-hero-content">
          <h2 class="dkv-hero-card__title">${slide.title}</h2>
          <p class="dkv-hero-card__description">${slide.content}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="dkv-small-card">
      ${numberTag}
      <button class="dkv-edit-icon-btn" data-id="${slide.id}">✎</button>
      <div class="dkv-small-content">
        <h3 class="dkv-small-card__title">${slide.title}</h3>
        <p class="dkv-small-card__description">${slide.content}</p>
      </div>
    </div>
  `;
};
