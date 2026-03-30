/**
 * Tiszta reaktív Store implementáció ES6 Proxy használatával.
 * SHADOW UNIVERSE - 100% FUNKCIONÁLIS TÜKRÖZÉS
 */

// A kezdeti állapot definíciója (SZÓ SZERINT az eredeti alapján)
const initialState = {
  projectTitle: '',
  projectShortDesc: '',
  stations: [],
  blueprint: '',
  narrative: [],
  currentSlideIndex: 0,
  isLoading: false,
  isGenerating: false,
  isWaitingForNarrative: false,
  isEditingBlueprint: false,
  isSetupMode: true,
  editingSlideId: null,
  isShowingIterationInstructions: false,
  iterationPrompt: '',
  toastMessage: '',
  notes: {},
  dkv_bridge_interval: null,
  sidebarCollapsed: true,
  sidebarContentVisible: false,
  sidebarIconsVisible: true,
  narrativeConfig: {
    onboardingCount: 3,
    introCount: 4,
    finaleCount: 3,
    stationCount: 5
  },
  isBridgeOnline: null,
  mode: 'passive', // 'bridge' | 'passive' (NFR1 alapon)
  isSyncing: false,
  lastSyncError: null,
  needsSync: false,
  viewingSlideId: null,
  theme: localStorage.getItem('dkv_theme') || 'cyber-fantasy'
};

const listeners = new Set();

/**
 * A globális Store objektum Proxy-val védve a reaktivitásért.
 * SZÓ SZERINTI MÁSOLÁS: src/services/store.js (44-53. sor)
 */
export const store = new Proxy(initialState, {
  set(target, property, value) {
    if (target[property] === value) return true;
    target[property] = value;
    listeners.forEach(fn => fn(property, value));
    return true;
  }
});

/**
 * Feliratkozás a Store változásaira.
 * Támogatja a globális és az ingatlan-specifikus (per-property) feliratkozást is.
 * @param {string|Function} propOrFn - A tulajdonság neve VAGY a globális callback.
 * @param {Function} [fn] - A callback, ha az első paraméter a tulajdonság neve.
 */
export const subscribe = (propOrFn, fn) => {
  if (typeof propOrFn === 'function') {
    listeners.add(propOrFn);
    return () => listeners.delete(propOrFn);
  } else {
    const wrappedFn = (p, v) => {
      if (p === propOrFn) fn(v);
    };
    listeners.add(wrappedFn);
    return () => listeners.delete(wrappedFn);
  }
};

// Kényelmi funkció: a store-hoz is hozzáadjuk a subscribe metódust, 
// mert a komponensek így hivatkoznak rá.
store.subscribe = subscribe;

export const updateState = (updates) => {
  Object.assign(store, updates);
};
