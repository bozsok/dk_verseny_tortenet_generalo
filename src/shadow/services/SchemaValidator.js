import { Logger } from './Logger.js';

/**
 * SchemaValidator - Adat-integritásért felelős segédosztály (Rule 62).
 * Biztosítja, hogy csak a várt struktúrájú adatok kerüljenek a Store-ba (NFR6).
 */
export class SchemaValidator {
  
  /**
   * Narratív dia (Card/Slide) validálása.
   * Elvárt: { id: string, title: string, content: string }
   * @param {Object} card 
   * @returns {Object|null} A megtisztított objektum vagy null, ha érvénytelen.
   */
  static validateCard(card) {
    if (!card || typeof card !== 'object') return null;
    
    const required = ['id', 'title', 'content'];
    const missing = required.filter(key => 
      !card[key] || (typeof card[key] !== 'string' && typeof card[key] !== 'number')
    );
    
    if (missing.length > 0) {
      Logger.warn(`Schema: Érvénytelen dia adat (hiányzó vagy rossz típusú mezők: ${missing.join(', ')}).`, card);
      return null;
    }
    
    // Csak a szükséges mezőket adjuk vissza (Sanitization)
    return {
      id: String(card.id),
      title: String(card.title),
      content: String(card.content)
    };
  }

  /**
   * Projekt metaadatok validálása.
   * Elvárt: { title: string, prompt: string, narrativeConfig: object }
   * @param {Object} data 
   * @returns {Object|null}
   */
  static validateProject(data) {
    if (!data || typeof data !== 'object') return null;
    
    const hasTitle = data.title && typeof data.title === 'string';
    const hasPrompt = data.prompt && typeof data.prompt === 'string';
    const hasConfig = data.narrativeConfig && typeof data.narrativeConfig === 'object' && data.narrativeConfig !== null;
    
    if (!hasTitle || !hasPrompt || !hasConfig) {
      Logger.error('Schema: Kritikus hiba a projekt metaadatokban (hiányzó title, prompt vagy config).', data);
      return null;
    }
    
    return {
      title: data.title,
      prompt: data.prompt,
      narrativeConfig: { ...data.narrativeConfig }
    };
  }

  /**
   * Mesterleíró (Master Blueprint) validálása.
   * Elvárt: { version: string, blueprint: string }
   * @param {Object} data 
   * @returns {Object|null}
   */
  static validateBlueprint(data) {
    if (!data || typeof data !== 'object') return null;
    
    const blueprintText = data.blueprint || data.content; // Flexibilitás a mezőnévre
    if (!blueprintText || typeof blueprintText !== 'string') {
      Logger.error('Schema: Érvénytelen Mesterleíró struktúra (hiányzó szöveges tartalom).', data);
      return null;
    }
    
    return {
      version: data.version || 'V4',
      blueprint: blueprintText
    };
  }
}
