/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PreviewShadow } from '../shadow/components/PreviewShadow.js';
import { store } from '../shadow/services/store.js';

describe('PreviewShadow Component', () => {
  let container;
  let component;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Alapállapot reset
    store.isGenerating = false;
    store.isWaitingForNarrative = false;
    store.narrative = [];
    
    component = new PreviewShadow();
  });

  afterEach(() => {
    if (component) component.destroy();
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    vi.clearAllMocks();
  });

  it('Alapértelmezetten a dia konténer látható (üres állapot)', () => {
    component.mount(container);
    const statusRoot = container.querySelector('#preview-status-root');
    const slidesContainer = container.querySelector('#slides-container');
    
    expect(statusRoot.style.display).toBe('none');
    expect(slidesContainer.style.display).toBe('block');
  });

  it('Megjeleníti a "SZINKRONIZÁCIÓ" overlay-t generálás alatt', () => {
    component.mount(container);
    const statusRoot = container.querySelector('#preview-status-root');
    const slidesContainer = container.querySelector('#slides-container');

    store.isGenerating = true;

    expect(statusRoot.style.display).toBe('flex');
    expect(statusRoot.textContent).toContain('SZINKRONIZÁCIÓ');
    expect(slidesContainer.style.display).toBe('none');
  });

  it('Megjeleníti a "VÁRAKOZÁS AI-RA" üzenetet ha nincs tartalom de várjuk', () => {
    component.mount(container);
    const statusRoot = container.querySelector('#preview-status-root');

    store.isWaitingForNarrative = true;
    store.narrative = [];

    expect(statusRoot.style.display).toBe('flex');
    expect(statusRoot.textContent).toContain('VÁRAKOZÁS AI-RA');
  });

  it('Eltünteti az overlay-t ha a generálás befejeződik és van tartalom', () => {
    component.mount(container);
    const statusRoot = container.querySelector('#preview-status-root');

    // 1. Generálás indul
    store.isGenerating = true;
    expect(statusRoot.style.display).toBe('flex');

    // 2. Tartalom megérkezik, generálás leáll
    store.narrative = [{ id: '1', title: 'Teszt' }];
    store.isGenerating = false;
    
    expect(statusRoot.style.display).toBe('none');
  });
});
