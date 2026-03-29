/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ShadowHeader } from '../shadow/components/ShadowHeader.js';
import { store } from '../shadow/services/store.js';

describe('ShadowHeader Component', () => {
  let container;
  let component;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Alapértelmezett store állapot (Fontos a reset, mert Singleton!)
    store.projectTitle = 'TESZT PROJEKT';
    store.isBridgeOnline = false;
    store.theme = 'cyber-fantasy';
    
    component = new ShadowHeader();
  });

  afterEach(() => {
    if (component) component.destroy();
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    vi.clearAllMocks();
  });

  it('Kezdeti renderelés a helyes címmel és offline indikátorral', () => {
    component.mount(container);
    
    const title = container.querySelector('.dkv-shadow-header__title');
    const indicator = container.querySelector('.dkv-shadow-bridge-indicator');
    
    expect(title.textContent).toContain('TESZT PROJEKT');
    expect(indicator.classList.contains('dkv-shadow-bridge-indicator--offline')).toBe(true);
  });

  it('Reaktívan frissíti a címet ha a store változik', () => {
    component.mount(container);
    
    store.projectTitle = 'ÚJ CÍM';
    const title = container.querySelector('.dkv-shadow-header__title');
    
    expect(title.textContent).toContain('ÚJ CÍM');
  });

  it('Átvált online állapotba és megjeleníti a megfelelő title-t', () => {
    component.mount(container);
    const indicator = container.querySelector('.dkv-shadow-bridge-indicator');
    
    store.isBridgeOnline = true;
    
    expect(indicator.classList.contains('dkv-shadow-bridge-indicator--online')).toBe(true);
    expect(indicator.getAttribute('title')).toBe('Bridge online');
  });

  it('A témaikon a store témájával szinkronban van', () => {
    component.mount(container);
    const themeIcon = container.querySelector('#header-theme-toggle span');
    
    expect(themeIcon.textContent).toBe('light_mode'); // Cyber-fantasy alapértelmezett
    
    store.theme = 'literary';
    expect(themeIcon.textContent).toBe('dark_mode');
  });
});
