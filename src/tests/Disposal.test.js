import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { disposalService } from '../shadow/services/disposal-service.js';
import { eventBus, EVENTS } from '../shadow/services/EventBus.js';
import { themeManager } from '../shadow/services/ThemeManager.js';
import { syncManager } from '../shadow/services/SyncManager.js';
import { store } from '../shadow/services/store.js';

/**
 * Disposal Management Tesztek (Rule 60)
 * Ellenőrzi, hogy a rendszer képes-e maradéktalanul kitakarítani az erőforrásokat.
 */
describe('Disposal Management & Rule 60', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
    // Alapértelmezett állapotok
    eventBus.listeners.clear();
    syncManager.init();
    themeManager.init();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Biztonsági takarítás a tesztek után
    disposalService.purge();
  });

  it('disposalService.purge() végrehajtja a regisztrált cleanup függvényeket', () => {
    const cleanupSpy = vi.fn();
    disposalService.add(cleanupSpy);
    
    expect(disposalService._cleanups.length).toBeGreaterThan(0);
    disposalService.purge();
    
    expect(cleanupSpy).toHaveBeenCalled();
    expect(disposalService._cleanups.length).toBe(0);
  });

  it('EventBus.clear() valóban törli az összes eseménykezelőt', () => {
    const callback = vi.fn();
    eventBus.on(EVENTS.THEME_CHANGE, callback);
    
    eventBus.clear();
    eventBus.emit(EVENTS.THEME_CHANGE, { theme: 'literary' });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('ThemeManager.disposal() leiratkozik a Store-ról', () => {
    const applySpy = vi.spyOn(themeManager, 'applyTheme');
    
    // Először ellenőrizzük, hogy működik-e a feliratkozás
    store.theme = 'literary';
    expect(applySpy).toHaveBeenCalledWith('literary');
    
    applySpy.mockClear();
    
    // Disposal után már nem szabad hívódnia
    themeManager.disposal();
    store.theme = 'cyber-fantasy';
    
    expect(applySpy).not.toHaveBeenCalled();
  });

  it('SyncManager.disposal() leállítja a folyamatban lévő mentéseket (debounce)', () => {
    const syncSpy = vi.spyOn(syncManager, 'performSync');
    store.mode = 'bridge';
    
    // Kiváltunk egy mentést
    store.projectTitle = 'New Project Name';
    
    // Disposal hívása a debounce lejárta előtt
    syncManager.disposal();
    
    // Idő feltekerése a debounce utánra
    vi.advanceTimersByTime(3000);
    
    expect(syncSpy).not.toHaveBeenCalled();
  });

  it('DisposableListener (disposalService) eltávolítja a DOM eseménykezelőket', () => {
    const btn = document.createElement('button');
    const clickSpy = vi.fn();
    
    disposalService.addDisposableListener(btn, 'click', clickSpy);
    
    btn.click();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    
    disposalService.purge();
    
    btn.click();
    expect(clickSpy).toHaveBeenCalledTimes(1); // Nem nőtt az értéke
  });
});
