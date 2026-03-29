import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bridgeService } from '../shadow/services/ShadowBridgeService.js';
import { store } from '../shadow/services/store.js';
import { setupBridgeMock, setupDelayedBridgeMock } from './mocks/bridge-mock.js';

/**
 * Környezetdetektálás Unit Tesztek (NFR1 validálás)
 */
describe('Environment Detection (NFR1)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Kezdeti állapot reset
    store.mode = 'passive';
    store.isBridgeOnline = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    bridgeService.disposal();
  });

  it('Gyors válasz (<500ms) esetén BRIDGE módba vált', async () => {
    setupBridgeMock({ '/health': { status: 'ok' } });
    
    await bridgeService.detectEnvironment();
    
    expect(store.mode).toBe('bridge');
    expect(store.isBridgeOnline).toBe(true);
  });

  it('Lassú válasz (>500ms) esetén PASSIVE módba vált (NFR1)', async () => {
    // 1000ms késleltetés a mock-ban (NFR1: 500ms korlát)
    setupDelayedBridgeMock(1000);
    
    const detectionPromise = bridgeService.detectEnvironment();
    
    // Előretekerjük az időt, hogy kiváltsuk az 500ms-os belső timeoutot
    vi.advanceTimersByTime(600);
    
    await detectionPromise;
    
    expect(store.mode).toBe('passive');
    expect(store.isBridgeOnline).toBe(false);
  });

  it('Hálózati hiba (pl. Bridge nincs elindítva) esetén PASSIVE módban marad', async () => {
    setupBridgeMock({ '/health': { error: 'Not Found' } });
    
    await bridgeService.detectEnvironment();
    
    expect(store.mode).toBe('passive');
    expect(store.isBridgeOnline).toBe(false);
  });

  it('Folyamatos polling közben is szinkronizálja a módot', async () => {
    // 1. Kezdetben online
    setupBridgeMock({ '/health': { status: 'ok' } });
    await bridgeService.checkHealth(); // Csak ellenőrizzük kézzel
    
    // 2. Szimuláljuk a hibaágat
    setupBridgeMock({ '/health': { error: 'Down' } });
    const isOnline = await bridgeService.checkHealth();
    
    expect(isOnline).toBe(false);
  });
});
