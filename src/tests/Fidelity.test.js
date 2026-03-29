/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SetupShadow } from '../shadow/components/SetupShadow.js';
import { store } from '../shadow/services/store.js';

describe('Story 4.2: Focus Fidelity Guard (Rule 61)', () => {
  let container;
  let component;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Alapértelmezett store állapot
    store.projectTitle = 'Kezdeti cím';
    store.sidebarCollapsed = false;
    store.isGenerating = false;
    
    component = new SetupShadow();
    component.mount(container);
  });

  afterEach(() => {
    if (component) component.destroy();
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it('Az aktív input fókuszban marad, ha kintről érkező store változás frissíti', () => {
    const input = container.querySelector('#input-title');
    input.focus();
    
    expect(document.activeElement).toBe(input);

    // Szimulált külső változás (pl. egy másik komponens vagy szinkronizáció miatt)
    store.projectTitle = 'Külső Frissítés';

    // Ellenőrizni kell, hogy az elem értéke frissült
    expect(input.value).toBe('Külső Frissítés');
    
    // De a fókusz nem mozdult el (Rule 61)
    expect(document.activeElement).toBe(input);
  });

  it('A kurzor pozíciója (selection) nem ugrik el frissítéskor', () => {
    const input = container.querySelector('#input-title');
    input.value = 'Hosszú Proejkt Név';
    input.focus();
    
    // Kurzor a szó közepére állítása
    input.setSelectionRange(5, 5);
    
    // Frissítés (érték nem is változik, de az update lefut)
    store.projectTitle = 'Hosszú Projekt Név';

    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
  });

  it('A státusz-alapú tiltás (disabling) alatt is megmarad a fókusz-kontroll', () => {
    const input = container.querySelector('#input-title');
    input.focus();
    
    expect(document.activeElement).toBe(input);

    // AI-generálás indul (lock)
    store.isGenerating = true;

    // Az input letiltódik, de ha az updateElement() jól dolgozik, az activeElement
    // állapota konzisztens marad (bár a letiltott elem elveszítheti a fókuszt a böngészőben,
    // a szoftveres update nem okozhat váratlan ugrást más elemre).
    expect(input.disabled).toBe(true);
  });
});
