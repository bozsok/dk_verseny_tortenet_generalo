/**
 * Tiszta reaktív Store implementáció ES6 Proxy használatával.
 * Biztosítja a globális állapot központosított kezelését és a komponensek értesítését.
 */

// A kezdeti állapot definíciója
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
  toastMessage: '',
  notes: {},
  dkv_bridge_interval: null,
  sidebarCollapsed: true,
  sidebarContentVisible: false, /* Nyitott tartalom láthatósága */
  sidebarIconsVisible: true,    /* Összecsukott nav ikonok láthatósága */
  narrativeConfig: {
    onboardingCount: 3,
    introCount: 4,
    finaleCount: 3,
    stationCount: 5
  },
  isBridgeOnline: null,
  needsSync: false,
  viewingSlideId: null,
  theme: localStorage.getItem('dkv_theme') || 'cyber-fantasy'
};

// Figyelők (listeners) halmaza a reaktív frissítésekhez
const listeners = new Set();

/**
 * A globális Store objektum Proxy-val védve a reaktivitásért.
 */
export const store = new Proxy(initialState, {
  set(target, property, value) {
    // Csak akkor frissítsünk és értesítsünk, ha az érték valóban megváltozott
    if (target[property] === value) return true;
    
    target[property] = value;
    listeners.forEach(fn => fn(property, value));
    return true;
  }
});

/**
 * Feliratkozás a Store változásaira.
 * @param {Function} fn - A callback függvény, ami lefut változáskor.
 * @returns {Function} - Függvény a leiratkozáshoz.
 */
export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/**
 * Segédfüggvény több tulajdonság egyszerre történő frissítéséhez.
 * @param {Object} updates - Az állapothoz hozzáadandó változások.
 */
export const updateState = (updates) => {
  Object.assign(store, updates);
};
