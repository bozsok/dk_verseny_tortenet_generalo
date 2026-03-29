import { store } from './services/store.js';
import './css/shadow.css';
import { RootShadow } from './components/RootShadow.js';
import { Logger } from './services/Logger.js';
import { disposalService } from './services/disposal-service.js';
import { UIController } from './services/ui-controller.js';
import { bridgeService } from './services/ShadowBridgeService.js';
import { eventBus } from './services/EventBus.js';
import { syncManager } from './services/SyncManager.js';
import { themeManager } from './services/ThemeManager.js';

/**
 * SHADOW UNIVERSE - MAIN ENTRY POINT
 * Az Árnyék-rendszer inicializálása a RootShadow komponenssel.
 * Ez a megvalósítás leváltja a régi, manuális DOM manipulációt.
 */

/**
 * Periodikusan ellenőrzi az AI Sync Bridge állapotát.
 */
function startBridgePolling() {
  const check = async () => {
    if (document.hidden) return;
    const isOnline = await bridgeService.checkHealth();
    store.isBridgeOnline = isOnline;
    store.mode = isOnline ? 'bridge' : 'passive';
  };

  check();
  const intervalId = setInterval(check, 3000);
  
  // Regisztráció a takarításhoz (Rule 60)
  disposalService.add(() => {
    clearInterval(intervalId);
    Logger.info('Shadow: Bridge polling leállítva.');
  });
}

async function loadInitialShadowState() {
  Logger.info('Shadow: Kezdeti állapot betöltése...');
  try {
    // 1. Mesterleíró (Blueprint Master) betöltése - SHADOW ISOLATION
    const masterData = await bridgeService.getMasterBlueprint();
    if (masterData && masterData.blueprint) store.blueprint = masterData.blueprint;

    // 2. Blueprint (projekt adatok) betöltése - SHADOW ISOLATION
    const data = await bridgeService.getProjectData();
    if (data) {
      if (data.title) store.projectTitle = data.title;
      if (data.prompt) store.prompt = data.prompt;
    }

    // 3. Narratíva adatok betöltése - API-n keresztül (JSON), hogy elkerüljük a Vite HMR-t
    const narrative = await bridgeService.getNarrative();
    if (narrative.length > 0) {
      store.narrative = [...narrative];
      Logger.info(`Shadow: ${narrative.length} dia betöltve a Bridge-ből.`);
    }
    
    Logger.info('Shadow: Állapot sikeresen betöltve.');
  } catch (err) {
    Logger.error('Shadow: Hiba az állapot betöltésekor:', err);
  }
}

/**
 * Az Árnyék-rendszer indítása
 */
async function startShadowUniverse() {
  Logger.info('Shadow: Univerzum indítása...');
  
  // Takarítás az esetleges korábbi futásból (Rule 60 - HMR stabilitás)
  disposalService.purge();
  
  // Szervizek regisztrálása a központi takarításba (Rule 60)
  disposalService.add(() => bridgeService.disposal());
  disposalService.add(() => eventBus.clear());
  disposalService.add(() => syncManager.disposal());
  disposalService.add(() => themeManager.disposal());
  
  // Bridge detektálás (NFR1: 500ms szigorú korlát)
  await bridgeService.detectEnvironment();
  
  // Bridge polling indítása
  startBridgePolling();

  // Adatok betöltése (Bridge hívásokkal, vagy fallback-el a 1.3-as sztori után)
  await loadInitialShadowState();
  
  // Szinkronizációs menedzser indítása az adatbetöltés UTÁN (ADR-03)
  syncManager.init();

  // Root komponens inicializálása és mountolása
  const appContainer = document.querySelector('#app');
  if (!appContainer) {
    Logger.error('Shadow: Nem található #app konténer!');
    return;
  }

  // AGRESSZÍV TAKARÍTÁS: Töröljünk minden maradványt az eredeti UI-ból
  appContainer.innerHTML = '';
  document.body.classList.add('dkv-shadow-active');

  // Téma beállítása a store-ból (vagy alapértelmezett)
  const theme = store.theme || localStorage.getItem('dkv_theme') || 'cyber-fantasy';
  document.documentElement.dataset.theme = theme;
  document.body.setAttribute('data-theme', theme);

  // RootShadow létrehozása és indítása
  const root = new RootShadow();
  root.mount(appContainer);

  // Globális szolgáltatások indítása
  UIController.setupGlobalListeners();

  Logger.info('Shadow: Rendszer készen áll.');
}

// Start
startShadowUniverse();
