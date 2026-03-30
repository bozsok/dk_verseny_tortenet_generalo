import { Logger } from './Logger.js';

/**
 * Feldolgozza a beolvasott szöveget és kinyeri a címet és a diákat.
 * @param {string} text - A fájl tartalma.
 * @param {'markdown'|'text'} format - A fájl formátuma.
 * @returns {Object} { title, narrative }
 */
export function parseNarrativeContent(text, format) {
  const narrative = [];
  let title = '';

  // 1. Normalizálás: Windows-stílusú sorvégek kezelése és szélső szóközök levágása
  const cleanContent = text.replace(/\r\n/g, '\n').trim();

  if (format === 'markdown') {
    // Cím keresése (# [Title])
    const titleMatch = cleanContent.match(/^#\s+(.*)$/m);
    if (titleMatch) title = titleMatch[1].trim();

    // Rugalmasabb elválasztó regex
    const sections = cleanContent.split(/\n\s*---\s*\n/);
    Logger.debug(`Markdown Parser: ${sections.length} szakaszt találtam.`);

    sections.forEach((section) => {
      // Rugalmasabb Dia fejléc: ## Dia X[: ] Cím
      const slideMatch = section.match(/## Dia \d+:?\s*(.*)\n([\s\S]*)/i);
      if (slideMatch) {
        narrative.push({
          id: `slide-load-${Date.now()}-${narrative.length}`,
          title: slideMatch[1].trim(),
          content: slideMatch[2].trim()
        });
      }
    });

    // Fallback: Ha nincs --- elválasztó, közvetlenül a DIA mintára bontunk
    if (narrative.length === 0) {
      _parseFallback(cleanContent, narrative);
    }
  } else {
    // Sima szöveg formátum
    const lines = cleanContent.split('\n');
    if (lines.length > 0) title = lines[0].trim();

    // Rugalmasabb elválasztó regex a .txt-hez
    const sections = cleanContent.split(/\n\s*-{3,}\s*\n/);
    Logger.debug(`Text Parser: ${sections.length} szakaszt találtam.`);

    sections.forEach((section) => {
      // Rugalmasabb DIA fejléc: DIA X[: ] Cím
      const slideMatch = section.match(/DIA \d+:?\s*(.*)\n([\s\S]*)/i);
      if (slideMatch) {
        narrative.push({
          id: `slide-load-${Date.now()}-${narrative.length}`,
          title: slideMatch[1].trim(),
          content: slideMatch[2].trim()
        });
      }
    });

    // Fallback: Ha nincs --- elválasztó, közvetlenül a DIA mintára bontunk
    if (narrative.length === 0) {
      _parseFallback(cleanContent, narrative);
      // Cím kiaknázása az első sorból, ha még nincs
      if (!title && narrative.length > 0) {
        const firstLine = cleanContent.split('\n')[0].trim();
        if (!firstLine.match(/^DIA\s+\d+/i)) title = firstLine;
      }
    }
  }

  Logger.info(`Parser: ${narrative.length} dia feldolgozva. Cím: "${title}"`);
  return { title, narrative };
}

/**
 * Fallback parser: DIA N: Cím mintára bontja a szöveget
 * (Kompatibilis a saját export formátummal)
 */
function _parseFallback(text, narrative) {
  const slideRegex = /DIA\s+\d+:?\s*(.*)\n([\s\S]*?)(?=\nDIA\s+\d+|$)/gi;
  let match;
  while ((match = slideRegex.exec(text)) !== null) {
    const slideTitle = match[1].trim();
    const slideContent = match[2].trim();
    if (slideTitle && slideContent) {
      narrative.push({
        id: `slide-load-${Date.now()}-${narrative.length}`,
        title: slideTitle,
        content: slideContent
      });
    }
  }
  Logger.debug(`Fallback Parser: ${narrative.length} diát találtam.`);
}
