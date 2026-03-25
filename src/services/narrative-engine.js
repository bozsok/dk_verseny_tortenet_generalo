import { store } from './store.js';
import { Logger } from './Logger.js';

/**
 * A narratíva feldolgozásáért és vizualizációs adatainak előkészítéséért felelős osztály.
 */
export class NarrativeEngine {
  /**
   * Visszaadja a narratíva szekciókra bontott struktúráját.
   * @param {Array} narrative - A nyers narratíva tömb.
   * @returns {Array} A szekciók listája.
   */
  static getSections(narrative) {
    const total = narrative.length;
    if (total === 0) return [];

    // Dinamikus eloszlás a Store konfiguráció alapján
    const config = store.narrativeConfig || {
      onboardingCount: 3,
      introCount: 4,
      finaleCount: 3,
      stationCount: 5
    };

    const onCount = Math.min(config.onboardingCount, total);
    const inCount = Math.min(config.introCount, Math.max(0, total - onCount));
    const fiCount = Math.min(config.finaleCount, Math.max(0, total - (onCount + inCount)));
    const stationTotal = Math.max(0, total - (onCount + inCount + fiCount));
    const stationCount = config.stationCount || 5;
    const perStation = Math.floor(stationTotal / stationCount);
    const remainder = stationTotal % stationCount;

    let current = 0;
    const sections = [];

    // 1. Onboarding
    sections.push({ id: 'sec-on', title: 'ONBOARDING // KEZDÉS', start: current, end: (current += onCount), icon: '◈' });

    // 2. Bevezetés
    if (inCount > 0) {
      sections.push({ id: 'sec-in', title: 'INTRO // BEVEZETÉS', start: current, end: (current += inCount), icon: '✦' });
    }

    // 3. Állomások
    const stationColors = ['#00f2ff', '#9d50bb', '#ffcc00', '#ff0055', '#00ffaa', '#ff8800', '#ff00ff', '#00ff00', '#0000ff', '#ffffff'];
    for (let i = 0; i < stationCount; i++) {
      const count = perStation + (i < remainder ? 1 : 0);
      if (count > 0) {
        sections.push({
          id: `sec-st${i + 1}`,
          title: `${String(i + 1).padStart(2, '0')}. SZAKASZ // ${i + 1}. ÁLLOMÁS`,
          start: current,
          end: (current += count),
          color: stationColors[i],
          icon: '⬢'
        });
      }
    }

    // 4. Finálé
    if (fiCount > 0 || current < total) {
      sections.push({ id: 'sec-fi', title: 'VÉGE // FINÁLÉ', start: current, end: total, icon: '★' });
    }

    return sections;
  }

  /**
   * Legenerálja a navigációs térkép HTML-jét.
   * @param {Array} sections - A szekciók listája.
   * @returns {string} A mini-térkép HTML kódja.
   */
  static generateMiniMapHTML(sections) {
    return `
      <div class="dkv-mini-map">
        <h4 class="dkv-mini-map__title">Navigációs térkép</h4>
        <div class="dkv-mini-map__links">
          ${sections.map(s => `
            <a href="#${s.id}" class="dkv-jump-link" title="${s.title.split(' // ')[1]}">
              <span class="dkv-jump-link__icon" style="color: ${s.color || 'var(--neon-cyan)'}">${s.icon}</span>
              <span class="dkv-jump-link__text">${s.title.split(' // ')[1]}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Tisztítja az erőforrásokat.
   */
  static destroy() {
    Logger.info('NarrativeEngine: Erőforrások felszabadítva.');
  }
}
