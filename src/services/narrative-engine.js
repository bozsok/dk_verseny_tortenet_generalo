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

    // Alapértelmezett eloszlás (PRD szerint): 4 Onboarding, 4 Intro, 3 Finálé
    // A maradékot elosztjuk 5 állomásra.
    const onCount = Math.min(4, total);
    const inCount = Math.min(4, Math.max(0, total - onCount));
    const fiCount = Math.min(3, Math.max(0, total - (onCount + inCount)));
    const stationTotal = Math.max(0, total - (onCount + inCount + fiCount));
    const perStation = Math.floor(stationTotal / 5);
    const remainder = stationTotal % 5;

    let current = 0;
    const sections = [];

    // 1. Onboarding
    sections.push({ id: 'sec-on', title: 'KEZDÉS // ONBOARDING', start: current, end: (current += onCount), icon: '◈' });

    // 2. Bevezetés
    if (inCount > 0) {
      sections.push({ id: 'sec-in', title: 'SZINT // BEVEZETÉS', start: current, end: (current += inCount), icon: '✦' });
    }

    // 3. Állomások
    const stationColors = ['#00f2ff', '#9d50bb', '#ffcc00', '#ff0055', '#00ffaa'];
    for (let i = 0; i < 5; i++) {
      const count = perStation + (i < remainder ? 1 : 0);
      if (count > 0) {
        sections.push({
          id: `sec-st${i + 1}`,
          title: `${String(i + 1).padStart(2, '0')}. ÁLLOMÁS // SZAKASZ ${i + 1}`,
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
   * Legenerálja a Navigációs Térkép HTML-jét.
   * @param {Array} sections - A szekciók listája.
   * @returns {string} A mini-térkép HTML kódja.
   */
  static generateMiniMapHTML(sections) {
    return `
      <div class="dkv-mini-map">
        <h4 class="dkv-mini-map__title">Navigációs Térkép</h4>
        <div class="dkv-mini-map__links">
          ${sections.map(s => `
            <a href="#${s.id}" class="dkv-jump-link">
              <span style="color: ${s.color || 'var(--neon-cyan)'}">${s.icon}</span> ${s.title.split(' // ')[1]}
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
