/**
 * Tiszta reaktív Store implementáció ES6 Proxy használatával.
 * Biztosítja a globális állapot központosított kezelését és a komponensek értesítését.
 */

// A kezdeti állapot definíciója
const initialState = {
  projectTitle: '',
  projectShortDesc: '',
  stations: [],
  blueprint: `
# 📘 Mesterleíró: AI Narratív Generálási Útmutató (V2)

Ez a dokumentum a kerettörténetek generálásának technikai és narratív "receptje". Az AI-nak ezt követve kell felépítenie az informatika versenyek történetét, biztosítva a pontos dia-számokat és a dramaturgiai ívet.

---

## 🏗️ 1. Szerkezeti felépítés (Kötelező dia-számok)

A verseny egy lineáris folyamat, amely az alábbi blokkokból áll:

### A) ONBOARDING (Fix 3 dia)
1. Welcome (Üdvözléssel)
2. Registration (Regisztráció)
3. Character (Karakterválasztás)

### B) INTRÓ (Fix 4 dia)
1. Dia (Történet kezdete)
2. Dia (Konfliktus)
3. Dia (Ellenség/Fenyegetés)
4. Dia (Útnak indítás)

### C) ÁLLOMÁSOK (5 állomás x 4 dia = 20 dia)
1. Dia (Érkezés)
2. Dia (Kihívás részletezése)
3. Dia (Feladat beágyazása)
4. Dia (Siker & Átvezetés)

### D) FINÁLÉ (Fix 3-4 dia)
1. Dia (Végső kapu)
2. Dia (Végső próba)
3. Dia (Győzelem)
4. Dia (Összegzés)

---

## 🎨 2. Narratív szabályok
- Hosszúság: Minden dián legalább 4-6 mondatnyi leírás.
- Metaforák: Informatikai alapú fantasy kifejezések.
- Interaktivitás: Szólítsd meg a játékost.
`.trim(),
  narrative: [],
  currentSlideIndex: 0,
  isLoading: false,
  isGenerating: false,
  isEditingBlueprint: false,
  isSetupMode: true,
  editingSlideId: null,
  toastMessage: '',
  notes: {},
  sidebarCollapsed: false,
  sidebarContentVisible: true
};

// Figyelők (listeners) halmaza a reaktív frissítésekhez
const listeners = new Set();

/**
 * A globális Store objektum Proxy-val védve a reaktivitásért.
 */
export const store = new Proxy(initialState, {
  set(target, property, value) {
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
