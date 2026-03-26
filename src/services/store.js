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
# 📘 Mesterleíró: AI Narratív Generálási Útmutató (V3)

Ez a dokumentum a kerettörténetek generálásának technikai és narratív "receptje". Az AI-nak ezt követve kell felépítenie az informatika versenyek történetét, biztosítva a pontos dia-számokat és a dramaturgiai ívet.

---

## 🏗️ 1. Szerkezeti felépítés (Összesen 30 dia)

### A) ONBOARDING (Fix 3 dia)
1. **Welcome (Üdvözlés)**: Fogadtatás, a hős behívása a világba...
2. **Registration (Regisztráció)**: Név, becenév és osztály megadása.
3. **Character (Karakter)**: Hősavasztár kiválasztása.

### B) INTRÓ (Fix 4 dia)
1. **Dia (Történet kezdete)**: A világ alaphelyzete, békés állapot.
2. **Dia (Konfliktus)**: Valami elromlik, megjelenik a hiba vagy a legenda.
3. **Dia (ELLENSÉG BEMUTATÁSA)**: **Szigorúan itt mutasd be a gonosz programot vagy vírust!**
4. **Dia (Küldetés célja)**: A feladat és a végcél meghatározása. **A hős elindul a küldetésére.**

### C) ÁLLOMÁSOK (5 állomás x 4 dia = 20 dia)
1. **Dia (Érkezés)**: A helyszín vizuális bemutatása, hangulatfestés.
2. **Dia (Kihívás részletezése)**: Találkozás az őrzővel vagy a probléma leírása.
3. **Dia (FELADAT: [Cím])**: **A konkrét technikai feladat narratív felvezetése!**
4. **Dia (Siker & Átvezetés)**: Öröm a megoldás után, "kulcs/szkript" szerzése.

### D) FINÁLÉ (Fix 3 dia)
1. **Dia (Végső kapu)**: Megérkezés a központi maghoz.
2. **Dia (FELADAT: [Végső próba])**: **Az utolsó, nagy logikai kihívás!**
3. **Dia (Győzelem és összegzés)**: Gratuláció, a kód helyreállítása, végszó.

---

## 🎨 2. Nyelvi és stilisztikai szabályok
- **MTA 12. kiadás**: Szigorú helyesírás és egybeírás (pl. Adatpohár, Zajentitás, Pufferüveg).
- **Hivatalos magyarítás**: Kerüld az angol kifejezéseket! Mindig: **Avatár** (nem Avatar), **Puffer** (nem Buffer).
- **Hosszúság**: Minden dián legalább 4-6 mondatnyi részletes leírás legyen.
- **Interaktivitás**: Szólítsd meg a játékost ("Kódmester", "Te").

---

## 📝 3. Használati utasítás az AI számára
Amikor új történetet kérnek, add meg:
1. **Évfolyamot** (pl. 4. osztály)
2. **Történet címét és rövid leírását**
3. **5 állomás nevét és a hozzájuk tartozó 5 konkrét feladatot**

Az AI válasza egy olyan lista lesz, amely diárol diára (Slide 1, Slide 2, stb.) tartalmazza a teljes szöveget.
`.trim(),
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
  viewingSlideId: null
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
